const {Bid, Interests} = require("./Bid");

class Session {
    constructor() {
        this._name = "";
        this._programCommittee = [];
        this._papers = [];
        this._bids = [];
        this._assignments = new Map(); 
        this._stage = "Receiving";
        this._acceptancePercentage = 100;
    }

    name() { return this._name; }
    programCommittee() { return this._programCommittee; }
    reviewers() { return this._programCommittee; }

    addReviewer(user) {
        this._programCommittee.push(user);
    }

    canSubmit(paper) {
        return this.stage() === "Receiving" && paper.isValid();
    }

    submit(paper) {
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");
        this._papers.push(paper);
    }

    papers() { return this._papers; }
    bids() { return this._bids; }
    stage() { return this._stage; }
    setStage(stage) { this._stage = stage; }

    // transiciones
    closeSubmissions() {
        this.setStage("Bidding");
    }

    closeAndAssign() {
        if (this.stage() !== "Bidding") throw new Error("Must be in Bidding stage");
        this._assignReviewers();
        this.setStage("Reviewing");
    }

    closeReviewing() {
        if (this.stage() !== "Reviewing") throw new Error("Must be in Reviewing stage");
        this.setStage("Selection");
    }

    // bidding
    enterBid(paper, reviewer, interest) {
        if (this.stage() !== "Bidding")
            throw new Error("Cannot enter bids from the current stage.");

        if (this.bidExistsFor(paper, reviewer)) {
            this.bidFor(paper, reviewer).setInterest(interest);
        } else {
            this._bids.push(new Bid(paper, reviewer, interest));
        }
    }

    bidExistsFor(paper, reviewer) {
        return typeof this.bidFor(paper, reviewer) !== "undefined";
    }

    bidFor(paper, reviewer) {
        return this._bids.find(b => b.paper() === paper && b.reviewer() === reviewer);
    }

    interestFor(paper, reviewer) {
        return this.bidFor(paper, reviewer).interest();
    }

    //  asignación consigna 4.1 
    _assignReviewers() {
        const papers = this._papers;
        const reviewers = this._programCommittee;
        const A = papers.length;
        const R = reviewers.length;

        if (R === 0) throw new Error("No reviewers available");
        if (A === 0) return;

        // calcula cuántas revisiones debe hacer cada revisor
        const total = 3 * A;
        const base = Math.floor(total / R);
        const extra = total % R;

       
        const capacity = new Map();
        reviewers.forEach((r, i) => {
            capacity.set(r, i < extra ? base + 1 : base);
        });

        
        papers.forEach(p => this._assignments.set(p, []));

        // orden de prioridad para un revisor en un artículo determinado
        const priorityOf = (paper, reviewer) => {
            const bid = this.bidFor(paper, reviewer);
            if (!bid) return 2;                              
            if (bid.interest() === Interests.Interested) return 0;
            if (bid.interest() === Interests.Maybe) return 1;
            if (bid.interest() === Interests.NotInterested) return 3;
            return 4;
        };

       
        const authorsOf = (paper) => paper._authors || [];

      // asignación en 3 rondas, un revisor por artículo por ronda.
        for (let round = 0; round < 3; round++) {
            for (const paper of papers) {
                const assigned = this._assignments.get(paper);
                if (assigned.length > round) continue;

                const authors = authorsOf(paper);

                const eligible = reviewers
                    .filter(r =>
                        !authors.includes(r) &&
                        capacity.get(r) > 0 &&
                        !assigned.includes(r)
                    )
                    .sort((a, b) => priorityOf(paper, a) - priorityOf(paper, b));

                if (eligible.length === 0) {
                    
                    const borrowable = reviewers.find(r =>
                        !authors.includes(r) &&
                        !assigned.includes(r)
                    );
                    if (!borrowable)
                        throw new Error(`Could not assign 3 reviewers to paper: "${paper.title()}"`);
                    capacity.set(borrowable, capacity.get(borrowable) + 1);
                    assigned.push(borrowable);
                    capacity.set(borrowable, capacity.get(borrowable) - 1);
                } else {
                    const chosen = eligible[0];
                    assigned.push(chosen);
                    capacity.set(chosen, capacity.get(chosen) - 1);
                }
            }
        }
    }

    assignmentsFor(paper) {
        return this._assignments.get(paper) || [];
    }

    isAssigned(paper, reviewer) {
        return this.assignmentsFor(paper).includes(reviewer);
    }

    _interestLevelFor(paper, reviewer) {
        const bid = this.bidFor(paper, reviewer);
        return bid ? bid.interest() : null;
    }

    // carga de revisiones  consigna 4.2
    addReview(paper, reviewer, text, score) {
        if (this.stage() !== "Reviewing")
            throw new Error("Reviews can only be added during the Reviewing stage");
        if (!this.isAssigned(paper, reviewer))
            throw new Error("Reviewer is not assigned to this paper");
        if (score < -3 || score > 3 || !Number.isInteger(score))
            throw new Error("Score must be an integer between -3 and +3");

        paper.addReview(reviewer, text, score);
    }

    // selección de artículos consigna 4.3
    setAcceptancePercentage(pct) {
        if (pct < 0 || pct > 100) throw new Error("Percentage must be between 0 and 100");
        this._acceptancePercentage = pct;
    }

    selectPapers() {
        if (this.stage() !== "Selection")
            throw new Error("Selection can only happen during the Selection stage");

        const maxAccepted = Math.floor(this._papers.length * this._acceptancePercentage / 100);
        const sorted = [...this._papers].sort((a, b) => b.score() - a.score());
        return sorted.slice(0, maxAccepted);
    }
}

module.exports = Session;
