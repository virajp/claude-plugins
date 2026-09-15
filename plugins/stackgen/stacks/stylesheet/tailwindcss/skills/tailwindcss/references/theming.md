# Theming — the light/dark switch and what it costs

One decision for the whole product. Made once, in the entry stylesheet, and not
revisited per component.

## The three forms

**An attribute on the root element.** The default, and the only form a user can
override: someone who wants dark against a light system preference needs
somewhere for that choice to land. Redefine the dark variant to read it:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

The `:where()` is not decoration. It holds the variant's specificity at zero,
so a dark rule never beats an unrelated but more specific rule for a reason
nobody chose. Drop it and debugging a dark-only layout bug becomes a
specificity hunt.

**A class on the root element.** The same shape with a class selector instead.
Pick it only where something already puts a class there; it has no advantage
over the attribute and reads less clearly next to other state attributes.

**The system preference alone.** The simplest, and it is a decision never to
offer a toggle: there is nothing for a preference to be stored in. Honest for a
documentation site, wrong for anything with user settings — adding the toggle
later is a migration through every rule.

Record which was chosen, and why, in the project's own conventions. The
choice is invisible from the stylesheet otherwise.

## First paint

**A server-rendered page paints before any script runs.** Whatever sets the
attribute must run in the document head, synchronously, before the body
renders — otherwise the first frame is the default theme and every visitor with
the other preference sees the flash.

The script itself belongs to the head doctrine, not here. What belongs here:
**the attribute name it writes must be the one the variant above reads.** Two
places name it, they are in different files, and nothing checks that they
agree — a rename in one is a product that never goes dark.

## Both schemes are the contract

The design system defines a light **and** a dark value for every colour role.
So:

- **A role with only one value defined is a gap in the design system**, not a
  case for inventing the second here. Report it; do not pick a shade.
- **A component may not test the theme.** No branching on the attribute in
  markup or script to choose a colour — that is the role mapping done a second
  time, in a place the contract cannot see. The utility already resolves to the
  right value.
- **An image or an illustration may legitimately need two assets.** That is a
  content decision, made in the markup with the scheme as a media condition,
  and it is the one place the scheme is allowed to be visible above the token
  layer.

## Reduced motion

The design system states a reduced-motion behaviour, and it is a **sibling of
the theme decision** rather than part of it: the same root, the same one place,
and the same failure if it is re-decided per component. Honour it with the
motion-preference variant, and treat an animation with no reduced-motion
answer as incomplete rather than as a default.
