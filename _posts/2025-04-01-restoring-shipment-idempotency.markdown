---
layout: post
title:  "Restoring Integrity to the Shipment Creation Pipeline"
date:   2025-04-01 12:00:00 -0300
categories: portfolio
---
# Ghost packages don’t scale.

We started seeing something that should not happen: duplicate shipments for a single order. Our domain logic was supposed to prevent that, but under certain conditions two shipments were still being created. It didn’t happen often, which made it harder to spot and easier to miss.

I went through the whole shipment generation flow in Spree, tracing how state transitions, inventory units, and the shipment builders interact. The problem was not just a missing validation. It came from timing and some implicit framework behavior that allowed shipment creation to run more than once when certain transitions overlapped.

Instead of adding another guard on top, I added idempotency checks at the domain level and tightened where shipment creation can happen. After that, shipment generation became predictable. One order, one shipment, every time.