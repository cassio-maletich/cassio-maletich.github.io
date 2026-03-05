---
layout: post
title:  "Restoring Integrity to the Shipment Creation Pipeline"
date:   2025-04-01 12:00:00 -0300
categories: portfolio
---
# Ghost packages don’t scale.

We began seeing something that should have been impossible: duplicate shipments for single orders. Our domain logic explicitly prevented this, yet under certain edge conditions, two shipments were being created. It wasn’t frequent — which made it more dangerous.

I audited the entire shipment generation pipeline inside Spree, tracing how state transitions, inventory units, and shipment builders interacted. The issue wasn’t a simple validation gap. It was a combination of timing and implicit framework behavior that allowed shipment creation to be triggered more than once when specific transitions overlapped.

Rather than rely on surface-level guards, I implemented domain-level idempotency protections and tightened the shipment creation boundaries. After that, shipment generation became structurally safe instead of conditionally safe. One order. One shipment. Always.
