# Generator

Examples: `stackgen-stack-template`, `stackgen-sync`. A generator writes files.
A skill that only returns data, such as `stackgen-stack-menu`, is not one.

| Section | Holds                                                    |
| ------- | -------------------------------------------------------- |
| Inputs  | Config, lockfile, answers                                |
| Consent | One explicit line per settings file it merges into       |
| Preview | A diff of what it will write. Comes before Write         |
| Write   | Script-driven rendering                                  |
| Record  | A lockfile or receipt entry per component                |
| Verify  | Parse each rendered file, and frontmatter as strict YAML |

A template must itself pass this lint — its output becomes the standard of
another repo.
