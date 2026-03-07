---
title: AI has a provenance problem
published: true
description: AI produces artifacts at scale. Datasets, models, outputs. There is no standard way to prove when any of them existed. Anchoring fixes that.
tags: ai, security, bitcoin, devops
canonical_url: https://umarise.com/blog/ai-provenance
---

The AI world produces enormous volumes of digital artifacts: datasets, model weights, training configs, prompts, outputs, evaluation reports, generated media.

There is currently no standard way to prove when any of them existed.

## The current state

```
dataset_v4_final_really_final.csv
model_v12_fixed_new.pt
```

That is not proof. That is a filename.

There is no standard way to verify:

- when something existed
- whether it was changed
- which version it was
- which dataset belonged to which model

## Why this becomes a problem

AI governance and regulation increasingly require answers to:

- Where does this model come from?
- When was it trained?
- Which dataset was used?
- Was this document modified after the fact?

This matters across domains:

- **AI Act**: audit trails for AI systems
- **Research reproducibility**: proving results were not modified after publication
- **Copyright / IP**: proving when content existed
- **Deepfake detection**: establishing creation time of original media

## Anchoring at the artifact level

Anchoring turns each artifact into a verifiable proof object:

```
dataset.csv
dataset.csv.proof

model.bin
model.bin.proof

report.pdf
report.pdf.proof
```

The `.proof` contains: hash, timestamp, Bitcoin anchor.

Statement: these exact bytes existed no later than time T.

This resolves provenance at the lowest level: the artifact itself.

## Toward proof-driven AI systems

Current AI systems operate on trust. "This model was trained on dataset X." That statement is not verifiable.

Software supply chains already moved past this. A release ships with:

```
software release
+ signature (.sig)
+ bill of materials (.sbom)
```

For AI, the equivalent pattern:

```
model.pt
model.pt.proof

dataset_v3.parquet
dataset_v3.parquet.proof

training_config.json
training_config.json.proof

evaluation_report.md
evaluation_report.md.proof
```

## The chain of proof

```
dataset
   ↓
training
   ↓
model
   ↓
evaluation
   ↓
deployment
```

If each artifact carries a `.proof`, the result is verifiable AI provenance. Each step has a cryptographic anchor to a point in time.

## Primitive, not product

The common approach is building AI audit dashboards or compliance portals. The actual value sits in the primitive underneath.

| Primitive | Ecosystem built on top |
|---|---|
| TLS certificates | HTTPS |
| Git commits | Software development |
| OpenTimestamps | Timestamping |
| .proof files | Digital artifact verification |

If `.proof` becomes a standard, others build audit tools, compliance tools, AI governance tools, and document management systems on top of it.

## The positioning

Not AI infrastructure. Not blockchain startup.

**Proof infrastructure.**

The digital world consists of artifacts: code, datasets, models, documents, media, contracts, research. Anchoring adds one thing:

```
artifact + proof
```

The same way HTTPS became the default for websites (`website + TLS`), the equivalent for artifacts is `artifact + proof`.

---

- [How Umarise turns files into proof objects](https://umarise.com/blog/proof-objects)
- [Anchor build artifacts in one YAML line](https://umarise.com/blog/anchor-build-artifacts)
- [Specification — anchoring-spec.org](https://anchoring-spec.org)
- [Get your API key — umarise.com/developers](https://umarise.com/developers)
