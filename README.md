RepurposeQuest AI

An Explainable, Agentic Drug Repurposing Decision-Support System

📌 Overview

RepurposeQuest AI is an agentic, explainable AI platform designed to assist pharmaceutical researchers in identifying, validating, and prioritizing new therapeutic indications for existing drugs. Unlike traditional drug repurposing tools that rely on opaque prediction scores or static reports, RepurposeQuest AI integrates biological reasoning, multi-source evidence, and transparent explainability into a single decision-support workflow.

The system combines multi-agent orchestration, mechanism-first pathway analysis, and graph-based ranking to help scientists understand why a drug may work for a new disease, how evidence supports it, and how confident the recommendation is.

🎯 Problem Statement

Drug repurposing remains a manual, time-consuming, and fragmented process. Researchers must independently analyze scientific literature, clinical trials, patent landscapes, and biological pathways. Existing AI tools often provide black-box predictions without explainability or biological validation, resulting in low trust and limited real-world adoption.

RepurposeQuest AI addresses this gap by transforming drug repurposing into an explainable, biology-driven decision-making process.

🧩 Key Features

Agentic AI Orchestration using a Master Agent and specialized worker agents

Explainable Evidence Flow tracing recommendations to literature, trials, and patents

Mechanism-First Reasoning via pathway and MoA analysis

Graph Neural Network (GNN)–based ranking of drug–disease pairs

Interactive Visualizations (graphs, heatmaps, confidence scores)

Decision-Support Outputs, not black-box predictions

🏗️ System Architecture (High Level)
UI (React + D3.js)
        ↓
API Gateway (FastAPI)
        ↓
Master Agent (LangGraph)
        ↓
------------------------------------------------
| Literature Agent | Clinical Trials Agent |
| Patent Agent     | Market Agent          |
| GNN Agent        | Mechanism Explorer    |
------------------------------------------------
        ↓
Data Layer (Mock / Public / Proprietary Sources)

🔄 End-to-End Workflow

Researcher inputs an existing molecule and target pathway

Master Agent orchestrates specialized agents

Evidence is collected from literature, trials, and patents

Pathway-level reasoning validates biological plausibility

Explainable reasoning evaluates evidence contributions

GNN ranks repurposing opportunities with confidence scores

Results are presented via interactive dashboards and reports

🧠 Core Agents
🔹 Master Agent (Orchestrator)

Coordinates the overall workflow

Manages state, task delegation, and result aggregation

🔹 Literature Agent

Uses LLM + Retrieval-Augmented Generation (RAG)

Extracts mechanistic and experimental insights from research papers

🔹 Clinical Trials Agent

Analyzes trial phases, outcomes, and disease relevance

Uses public or mocked ClinicalTrials data

🔹 Patent Intelligence Agent

Identifies overlapping, expired, and white-space patents

Assesses IP feasibility of repurposing opportunities

🔹 Market Intelligence Agent

Evaluates disease prevalence and unmet need (mocked data)

🔹 Mechanism Explorer Agent

Performs MoA and pathway-level reasoning

Ensures biological plausibility before ranking

🔹 GNN Ranking Agent

Aggregates multi-source signals

Ranks drug–disease pairs with confidence scores

📊 Visual Outputs

Discovery Graph: Molecule–Pathway–Disease relationships

Explainable Evidence Flow: Contribution of each evidence source

Molecular Impact Heatmap: Pathway component impact per disease

Opportunity Cards: Ranked indications with confidence scores

🛠️ Tech Stack
Backend

Python

FastAPI

LangGraph (agent orchestration)

AI / ML

LLMs (OpenAI / HuggingFace – planned)

Graph Neural Networks (PyTorch Geometric – planned)

Vector Search (FAISS – planned)

Frontend

React

D3.js (interactive graphs)

React Three Fiber (3D molecule visualization – planned)

Data

Public biomedical datasets (mocked initially)

Internal documents (simulated)

🚧 Current Status

⚠️ Prototype Stage

Architecture designed and validated

UI wireframes and interaction flows implemented

Agent responsibilities and workflows defined

Mock data used for demonstration

⏳ Code implementation in progress

🗺️ Step-by-Step Implementation Plan
Phase 1: Core Infrastructure

Setup FastAPI backend

Create API endpoints for analysis requests

Implement Master Agent using LangGraph

Phase 2: Agent Development

Implement Literature, Clinical Trials, and Patent Agents

Integrate mock data sources

Define agent communication protocols

Phase 3: Explainability Layer

Build evidence contribution tracking

Implement Explainable Evidence Flow logic

Phase 4: Ranking Engine

Implement GNN-based ranking

Generate confidence scores

Phase 5: Frontend Integration

Build interactive graphs and heatmaps

Connect backend APIs to UI

Enable report export

📈 Impact Metrics

Reduction in early-stage research time

Increase in number of hypotheses evaluated

Improved decision confidence among researchers

Reduced manual review effort

🔐 Disclaimer

RepurposeQuest AI is a research decision-support tool and is not intended for clinical diagnosis or treatment decisions. All outputs are designed to assist human experts, not replace them.

👥 Team – CuraNova AI

Sana Shaikh – Lead, Agentic AI & System Orchestration

Shriya Bhat – Agentic AI Engineer

Jiya Haldankar – Frontend & Data Visualization Engineer

Prathiksha Gajula – Backend & API Engineer

📄 License

This project is developed as part of EY Techathon 6.0 for academic and innovation purposes.
