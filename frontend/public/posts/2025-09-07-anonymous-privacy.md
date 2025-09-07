---
title: "Implementing Anonymous Accounts for Privacy Protection"
description: How NeuroFusion uses websockets and nostr deployed on azure to ensure anonymous privacy by default.
publishedDate: 2025/05/31
coverImage: /images/blog/neurofusion_auth_blog_card.png
tags:
  - Cognitive Experiments
  - Open Source
  - Neurological Conditions
slug: anonymous-privacy
authors:
  - name: Ore Ogundipe
---

NeuroFusion’s approach to privacy centers on anonymous accounts, leveraging websockets and Nostr protocols deployed on Azure. This architecture ensures that users can interact with the platform without revealing personal identifiers, supporting privacy by default.

### Technical Overview

NeuroFusion’s frontend communicates with backend services using secure websockets. These connections are established without requiring traditional authentication, instead utilizing ephemeral keys generated client-side. The backend, hosted on Azure, validates these keys and manages session state without storing user-identifiable data.

For decentralized messaging and data synchronization, NeuroFusion integrates Nostr—a protocol designed for censorship-resistant, anonymous communication. Each user session generates a unique Nostr keypair, enabling encrypted interactions with relays. All data exchanged is end-to-end encrypted, and no persistent identifiers are retained. You can checkout [your generated profile here](https://usefusion.ai/profile)

Azure’s infrastructure provides scalable websocket endpoints and relay services, ensuring low-latency communication and robust privacy guarantees. The combination of stateless authentication, encrypted messaging, and decentralized relays allows NeuroFusion to offer cognitive experiments and neurological condition support without compromising user anonymity.

### Key Features

- **Anonymous Account Creation:** No email or personal info required; users interact via ephemeral keys.
- **End-to-End Encryption:** All websocket and Nostr communications are encrypted.
- **Decentralized Relays:** Data is synchronized using Nostr relays, preventing centralized data collection.
- **Azure Scalability:** Websocket endpoints and relay services scale automatically to support global users.

This privacy-first architecture empowers users to participate in cognitive experiments and access neurological resources securely and anonymously.

### So what if you want to use your own identifiers for research participants

If you need to collect participant identifiers for research purposes, NeuroFusion supports this through the admin [Quest Dashboard](https://usefusion.ai/quests). Administrators can add custom onboarding questions, allowing participants to enter their chosen identifiers during account creation or experiment enrollment. This flexible approach ensures that identifiers are only collected when explicitly required, maintaining privacy for all other users by default.

### Getting started with creating your study

See detailed documentation below on creating your first quest and start collecting data

<button><a href="https://docs.usefusion.ai/createquests">Create a new quest on NeuroFusion Explorer</a></button>
