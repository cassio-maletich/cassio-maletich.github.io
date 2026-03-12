---
layout: post
title:  "Resolving Lifecycle Collisions in Spree’s Order Pipeline"
date:   2025-04-12 12:00:00 -0300
categories: portfolio
---
# When taxes are calculated twice, nobody wins.

Checkout started behaving inconsistently in production. Totals would sometimes change in ways that didn’t make sense. After tracing the flow, I found that we had added an internal ActiveRecord hook that called create_tax_charge! while Spree was already calculating taxes inside its own checkout state machine. Nothing looked obviously wrong at first, but two different pieces of logic were trying to control the same thing.

The real challenge wasn’t just removing a duplicate call. It was understanding when everything in the lifecycle actually runs. Spree’s tax logic happens during state transitions and is closely tied to recalculation steps. Our custom hook worked on its own, but it ignored the orchestration happening inside Spree. I stepped through the transition chain, mapped the execution order, and found where the overlap was happening.

The fix ended up being about aligning with how Spree already works. I refactored the integration so it used Spree’s lifecycle instead of running alongside it. After that, checkout totals became consistent again. No duplicated tax charges and no confusing shifts in totals.
