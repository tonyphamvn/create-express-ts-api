import degit from 'degit';
import { downloadTemplate } from 'giget';
import { DEFAULT_GIGET_TEMPLATE, DEFAULT_TEMPLATE_REPO } from './constants.js';
import { copyLocalTemplate } from './copy-template.js';

function normalizeDegitSource(template) {
  if (template.startsWith('degit:')) {
    return template.replace(/^degit:/, '');
  }

  if (template.startsWith('github:')) {
    return template.replace(/^github:/, '');
  }

  return template;
}

export async function downloadProjectTemplate({ provider, template, targetDir, local }) {
  if (local) {
    return;
  }

  if (provider === 'degit') {
    const source = normalizeDegitSource(template || DEFAULT_TEMPLATE_REPO);
    const emitter = degit(source, {
      cache: false,
      force: true,
    });
    await emitter.clone(targetDir);
    return;
  }

  await downloadTemplate(template || DEFAULT_GIGET_TEMPLATE, {
    dir: targetDir,
    force: true,
  });
}
