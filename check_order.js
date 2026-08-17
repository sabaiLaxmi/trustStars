import { templates } from './app/data/templates.js';

templates.forEach((t, i) => {
  const planName = t.plan === 'BASIC' ? 'STARTER' : t.plan;
  console.log(`${i + 1}. ${t.name} (${planName})`);
});
