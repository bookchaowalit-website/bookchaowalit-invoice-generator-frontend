# Ledger — Design direction

## Product surface

Invoice Generator is a local THB invoice drafting tool. It accepts sender, recipient, line items, quantities, and rates, calculates a total, persists a draft in this browser, and exposes a copyable text version. It is not a tax or accounting service.

## Visual world

- **Seed:** \`cf8a725d\`, assigned direction index \`4\` (\`operate\`)
- **World:** a paper ledger desk: the entry side is ruled like an accountant's working sheet, while the preview is a loose invoice paper pulled from the stack.
- **Palette:** rice-paper cream \`#eee7d7\`, ink \`#262725\`, ledger red \`#a94335\`, and desaturated blue \`#344c5c\`.
- **Typography:** Newsreader gives the invoice and main title their printed character; DM Sans handles controls; DM Mono handles currency, labels, and measurements.
- **Composition:** the editable ledger stays flat and inspectable; the invoice preview is the only lifted object and is slightly rotated like a physical draft.
- **Interaction:** edit parties and line items, add/remove rows, watch the total update, and copy a plain-text invoice. Local autosave is named, not implied.
- **Responsive:** the ledger remains first; the paper preview follows and loses its desktop rotation on narrow screens. Line items stack description before numeric fields.

