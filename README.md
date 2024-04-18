# use-virtual-scroll

## Motivation

I built this for long and complex data-grids where I needed to control the number of items rendered.

The paged approach causes fewer re-renders while providing enough of a scroll buffer that users
cannot scroll past the rendered items.

## Setup

- Items must be the same height (this doesn't do variable height calculations)
-
