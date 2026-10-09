# Jetpack Compose — Paging

**Wiring, configuration and anti-patterns only.** The pager, source and
mediator API is Context7's at use time.

Paging loads a large list in pages as the user scrolls, with loading and error
states for each end of the list.

## Setup order

1. **Catalog entries** for `paging-runtime`, `paging-compose` and
   `paging-testing`, and Room's Paging support when Room is the source.
2. **Room is the source of truth.** The DAO returns a
   `PagingSource<Int, Entity>` and a `RemoteMediator` fills the table from the
   network when the list runs out, so the list works offline and survives
   process death. A list with no local copy uses a network `PagingSource`
   alone.
3. **The repository builds the `Pager`** with a `PagingConfig` (page size,
   prefetch distance) and exposes `Flow<PagingData<Model>>`, mapping entities to
   model types inside the flow.
4. **The ViewModel caches it** with `.cachedIn(viewModelScope)` and exposes the
   flow as its own property beside `uiState` — `PagingData` is not put inside
   the UI state data class.
5. **The screen collects with `collectAsLazyPagingItems()`** and feeds the
   items to a `LazyColumn` using `itemKey` and `itemContentType`.

## Structure

- **Draw the load states.** `loadState.refresh` drives the full-screen loading
  and error states; `loadState.append` drives a footer with a retry action.
- **Keys are stable ids**, so items keep their position and state across
  refreshes.
- **Filters and queries restart the pager** by mapping a query `StateFlow` with
  `flatMapLatest` in the ViewModel.

## Testing and goldens

- **`asSnapshot()`** from `paging-testing` collects a flow of `PagingData` into
  a list in a unit test.
- **Goldens use `PagingData.from(list)`** wrapped in `flowOf(...)`, so the
  screen renders fixed items with no source at all.

## Anti-patterns

| Anti-pattern                                 | Instead                                       |
| -------------------------------------------- | --------------------------------------------- |
| `PagingData` inside the UI state class        | a separate cached flow                       |
| No `cachedIn`                                | `cachedIn(viewModelScope)`, or rotation reloads |
| Network-only paging for data shown offline   | Room plus `RemoteMediator`                    |
| Ignoring `loadState`                         | draw loading, error and retry                 |
