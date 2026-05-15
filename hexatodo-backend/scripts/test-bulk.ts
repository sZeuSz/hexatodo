/* eslint-disable no-console */
const TOKEN = process.env['TOKEN'] ?? 'seu-token-aqui';
const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/tasks/bulk`;

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

const makeTasks = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ title: `Tarefa bulk ${i + 1}` }));

async function post(body: unknown): Promise<{ status: number; body: unknown }> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

interface TestCase {
  label: string;
  payload: unknown;
  expect: number;
}

const cases: TestCase[] = [
  {
    label: '1 task         → 201',
    payload: { tasks: makeTasks(1) },
    expect: 201,
  },
  {
    label: '1000 tasks     → 201',
    payload: { tasks: makeTasks(1000) },
    expect: 201,
  },
  {
    label: '1001 tasks     → 400',
    payload: { tasks: makeTasks(1001) },
    expect: 400,
  },
  {
    label: 'empty array    → 422',
    payload: { tasks: [] },
    expect: 422,
  },
  {
    label: 'missing tasks  → 422',
    payload: {},
    expect: 422,
  },
  {
    label: 'missing title  → 422',
    payload: { tasks: [{ description: 'sem titulo' }] },
    expect: 422,
  },
];

async function run(): Promise<void> {
  console.log('=== Bulk Create Tests ===\n');

  let passed = 0;

  for (const c of cases) {
    const res = await post(c.payload);
    const ok = res.status === c.expect;
    const icon = ok ? '✓' : '✗';
    console.log(`${icon} ${c.label} (got ${res.status})`);
    if (!ok) console.log('  body:', JSON.stringify(res.body));
    if (ok) passed++;
  }

  console.log(`\n${passed}/${cases.length} passed`);
}

run().catch(console.error);
