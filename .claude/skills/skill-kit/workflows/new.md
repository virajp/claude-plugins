# new

Creates a skill folder from an archetype template.

1. Read [archetypes.md](../references/archetypes.md), and choose by the
   membership test.
2. If two archetypes fit, ask the user.
3. Search the roots in `assets/config.json` for a folder with this name.
4. If the name is in use and the archetype is not adapter, stop and ask for
   another name.
5. Run the scaffold:

   ```sh
   node <skill-kit>/scripts/new.mjs <archetype> <name> <parent-dir> [--subtype <subtype>]
   ```

6. Replace each TODO. Follow [standard.md](../references/standard.md) and
   [style.md](../references/style.md).
7. Move each rare path into a reference, and mark it `sometimes` in the table.
8. Run `node <skill-kit>/scripts/lint.mjs <folder>`, and fix each error.
9. Dispatch a fresh reviewer with
   [the judgment prompt](../templates/judgment-reviewer-prompt.md).
10. Fix each confirmed finding.

Done when lint shows no error, and the reviewer returns no open finding.
