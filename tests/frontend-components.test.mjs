import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const url = new URL('../app/[locale]/dashboard/_components/presentation.tsx', import.meta.url);
function components() {
  const source = readFileSync(url, 'utf8');
  const {outputText} = ts.transpileModule(source, {compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020
  }});
  const compiledModule = {exports: {}};
  new Function('require', 'module', 'exports', outputText)(createRequire(fileURLToPath(url)), compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const render = (Component, props, child) => renderToStaticMarkup(React.createElement(Component, props, child));

test('presentation keeps localized content as escaped text and a single page heading', () => {
  const {PageHeader} = components();
  const html = render(PageHeader, {title: '<img src=x>', eyebrow: 'Firma', description: 'Kunden'});
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(html.startsWith('<header'));
  assert.ok(html.includes('&lt;img src=x&gt;'));
  assert.ok(html.includes('Firma') && html.includes('Kunden'));
});
test('metric labels stay paired with zero and restricted values', () => {
  const {MetricCard} = components();
  for (const value of [0, 'Restringido']) {
    const html = render(MetricCard, {label: 'Órdenes', value});
    assert.match(html, /<dt[^>]*>Órdenes<\/dt>/);
    assert.ok(html.includes(`>${value}</dd>`));
  }
});
test('status is readable without color and unknown states retain their label', () => {
  const {StatusBadge} = components();
  for (const status of ['completed', 'cancelled', 'in_progress', 'future-state']) {
    const html = render(StatusBadge, {status}, 'Estado traducido');
    assert.ok(html.includes('Estado traducido'));
    assert.ok(!html.includes('aria-hidden'));
  }
});
test('shell and panels retain server-rendered actions and fragment targets', () => {
  const {AppShell, Panel} = components();
  const html = render(AppShell, {}, React.createElement(Panel, {id: 'create-order'}, React.createElement('a', {href: '/es/dashboard'}, 'Volver')));
  assert.ok(html.includes('id="create-order"'));
  assert.ok(html.includes('href="/es/dashboard"'));
  assert.doesNotMatch(readFileSync(url, 'utf8'), /['"]use client['"]|supabase|localStorage/);
});

test('Premium surfaces use a light canvas, white panels and a dark blue heading', () => {
  const {AppShell, DetailShell, Panel, PageHeader} = components();
  for (const Shell of [AppShell, DetailShell]) {
    const html = render(Shell, {}, 'Contenido');
    assert.ok(html.includes('bg-[#f5f7fb]'));
    assert.ok(html.includes('text-[#14263c]'));
    assert.ok(html.includes('[color-scheme:light]'));
  }
  assert.ok(render(Panel, {}, 'Panel').includes('bg-white'));
  const header = render(PageHeader, {title: 'Aufträge'});
  assert.ok(header.includes('bg-[#142c4b]') && header.includes('text-white'));
});

test('Premium body and header text colors meet normal text contrast', () => {
  const source = readFileSync(url, 'utf8');
  const luminance = hex => {
    const values = hex.match(/[a-f0-9]{2}/gi).map(value => parseInt(value, 16) / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
  };
  for (const [foreground, background] of [['14263c', 'f5f7fb'], ['52637b', 'ffffff'], ['ffffff', '142c4b'], ['ffffff', '3265df']]) {
    assert.ok(source.includes(`#${foreground}`) || foreground === 'ffffff');
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    assert.ok((values[0] + .05) / (values[1] + .05) >= 4.5, `${foreground} on ${background}`);
  }
});

test('embedded invitation controls use the light surface and visible focus', () => {
  const source = readFileSync(new URL('../app/[locale]/dashboard/invitations/invite-form.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /bg-slate-9[05]0|text-rose-300|text-amber-200/);
  assert.match(source, /focus-visible:outline/);
});
