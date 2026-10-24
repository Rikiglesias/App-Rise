// C22 per C78 (workflow GitHub, legge la rete): la verifica è pura, qui riceve dati sintetici. Ogni fixture
// negativa è il positivo con UNA mutazione. Diviso da selftest-f13-esterni.mjs per restare sotto le 300 righe.
import YAML from 'yaml';
import { CI_C78, OTA_C78 } from './f13-workflow.mjs';
import { casi } from './selftest-f13-esterni.mjs';

const SHA = 'a'.repeat(40);
const CI = `on:
  push:
    branches: [master]
permissions: {}
jobs:
  build-android:
    if: github.ref == 'refs/heads/master'
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@${SHA} # v8.2.1
      - run: echo "$MSG"
        env:
          MSG: \${{ github.event.inputs.message }}
  notify:
    permissions:
      pull-requests: write
    steps:
      - uses: actions/github-script@v7
`;
const OTA = `on:
  workflow_dispatch:
    inputs:
      message:
        type: string
jobs:
  deploy-ota:
    if: github.event_name == 'workflow_dispatch'
    permissions:
      contents: read
    steps:
      - run: echo ok
`;
const wf = (nome, testo) => {
  try {
    return { nome, testo, doc: YAML.parse(testo), errore: null };
  } catch (e) {
    return { nome, testo, doc: null, errore: e.message };
  }
};
const C78_OK = {
  file: [wf(CI_C78, CI), wf(OTA_C78, OTA)],
  tag: { 'expo/expo-github-action': { 'v8.2.1': ['b'.repeat(40), SHA] } },
  base: { [CI_C78]: YAML.parse(CI), [OTA_C78]: YAML.parse(OTA) },
  actionlint: null,
};
const ci78 = testo => ({ file: [wf(CI_C78, testo), wf(OTA_C78, OTA)] });
const ota78 = testo => ({ file: [wf(CI_C78, CI), wf(OTA_C78, testo)] });
// L'uscita di un passo che legge un input è lo stesso input di seconda mano (ota-deploy.yml:127).
const PASSO_MSG = `      - id: msg
        run: echo "message=$M" >> "$GITHUB_OUTPUT"
        env:
          M: \${{ github.event.inputs.message }}
`;
const OTA_ENV = OTA.replace(
  '      - run: echo ok\n',
  `${PASSO_MSG}      - run: eas update --message "$MESSAGE"
        env:
          MESSAGE: \${{ steps.msg.outputs.message }}
`
);
const OTA_SHA = OTA.replace(
  '      - run: echo ok\n',
  `      - id: sha
        run: echo "short=$(git rev-parse --short HEAD)" >> "$GITHUB_OUTPUT"
      - run: echo "\${{ steps.sha.outputs.short }}"
`
);
const OTA_CATENA = OTA_ENV.replace(
  '      - run: eas update',
  `      - id: pulito
        run: echo "testo=$T" >> "$GITHUB_OUTPUT"
        env:
          T: \${{ steps.msg.outputs.message }}
      - run: echo "\${{ steps.pulito.outputs.testo }}"
      - run: eas update`
);
const OTA_NEEDS = OTA.replace(
  'jobs:\n',
  `jobs:\n  prepara:\n    outputs:\n      msg: \${{ steps.msg.outputs.message }}\n    steps:\n${PASSO_MSG}`
).replace(
  '      - run: echo ok\n',
  '      - run: echo "${{ needs.prepara.outputs.msg }}"\n'
);

export const FIXTURE_F13_WORKFLOW = {
  C78: casi(
    C78_OK,
    [
      { file: [] },
      ci78(CI.replace(`@${SHA} # v8.2.1`, '@v8')),
      ci78(CI.replace(' # v8.2.1', '')),
      ci78(CI.replace('v8.2.1', 'v8.2.0')),
      {
        tag: {
          'expo/expo-github-action': { errore: 'git ls-remote exit 128' },
        },
      },
      ci78(
        CI.replace('echo "$MSG"', 'echo "${{ github.event.inputs.message }}"')
      ),
      ci78(CI.replace('    permissions:\n      contents: read\n', '')),
      ci78(CI.replace('actions/github-script@v7', 'actions/checkout@v4')),
      ci78(CI.replace('branches: [master]', 'branches: [master, develop]')),
      ci78(CI.replace("github.ref == 'refs/heads/master'", 'always()')),
      ci78(`${CI}\n  rotto: [`),
      { actionlint: { exit: 1, uscita: 'errore' } },
      ota78(
        OTA_ENV.replace(
          'eas update --message "$MESSAGE"',
          'eas update --message "${{ steps.msg.outputs.message }}"'
        )
      ),
      ota78(OTA_CATENA),
      ota78(OTA_NEEDS),
      ota78(
        OTA_ENV.replace(
          '      - run: eas update',
          "      - uses: actions/github-script@v7\n        with:\n          script: console.log('${{ steps.msg.outputs.message }}')\n      - run: eas update"
        )
      ),
    ],
    [{ actionlint: { exit: 0, uscita: '' } }, ota78(OTA_ENV), ota78(OTA_SHA)]
  ),
};
