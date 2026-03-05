---
layout: post
title:  "Resolving Lifecycle Collisions in Spree’s Order Pipeline"
date:   2025-04-12 12:00:00 -0300
categories: portfolio
---
# When taxes are calculated twice, nobody wins.

Checkout started behaving inconsistently in production — totals occasionally shifting in ways that didn’t make sense. After tracing the flow, I discovered we had introduced an internal ActiveRecord hook that called create_tax_charge! at the same time Spree was already calculating taxes inside its own checkout state machine. Nothing was obviously “wrong,” but two mechanisms were competing for authority over the same responsibility.

The real challenge wasn’t removing a duplicate call — it was understanding lifecycle timing. Spree’s tax logic runs as part of state transitions, tightly coupled to recalculation steps. Our custom hook was technically valid, but it ignored the deeper orchestration happening under the hood. I stepped through the full transition chain, mapped execution order, and identified exactly where the collision occurred.

The fix wasn’t a patch — it was a structural realignment. I refactored the integration to respect Spree’s internal lifecycle rather than bypass it. After that, checkout totals became fully deterministic again. No race conditions. No silent duplicated data. Just one source of truth.
