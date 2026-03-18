"""
Test Corpus for IMAW V3 (Enterprise Translation)
================================================
Empirical validation corpus to prove 100% structural fidelity and 0% "Target Domain / RAG Trap" leakage across complex commercial domains.
"""

TEST_CORPUS = [
    {
        "id": 1,
        "source_logic": (
            "Master Services Agreement (MSA): "
            "1. Termination for Convenience requires 30 days written notice. "
            "2. Mutual Indemnification protects both parties from third-party IP claims. "
            "3. Limitation of Liability is capped at 12 months trailing revenue. "
            "4. Payment Terms are Net 45. "
            "Rule: Neither party may claim indirect or consequential damages under any circumstances."
        ),
        "target_domain": "Deal Desk Sales Playbook",
        "domain_category": "legal_to_sales"
    },
    {
        "id": 2,
        "source_logic": (
            "AWS Multi-Region Active-Active Architecture: "
            "1. Route 53 directs traffic based on latency routing. "
            "2. DynamoDB Global Tables provide cross-region asynchronous replication. "
            "3. Transit Gateway connects VPCs across regions. "
            "4. Auto Scaling Groups maintain at least 3 EC2 instances per Availability Zone. "
            "Rule: In a regional failure, Route 53 must automatically fail over all traffic to the secondary region within 60 seconds."
        ),
        "target_domain": "SOC2 Gap Assessment and Compliance Checklist",
        "domain_category": "engineering_to_compliance"
    },
    {
        "id": 3,
        "source_logic": (
            "Phase III Double-Blind Monoclonal Antibody Trial: "
            "1. The experimental group receives 50mg intravenously every 14 days. "
            "2. The control group receives a saline placebo. "
            "3. The primary endpoint is a 30% reduction in inflammatory biomarkers at week 12. "
            "4. Adverse events include mild injection site erythema (15% of patients). "
            "Rule: If a patient develops a Grade 3 anaphylactic reaction, the patient must be immediately withdrawn from the protocol."
        ),
        "target_domain": "Patient Welcome Pamphlet and Dosage Guide",
        "domain_category": "medical_to_consumer"
    }
]
