const {Bid, Interests} = require("./Bid");

class Session{
    constructor(){
        this._name = "";
        this._programCommittee=[];
        this._papers=[];
        this._bids=[];
        this._stage="Receiving";
    }
    name(){
        return this._name;
    };
    programCommittee(){
        return this._programCommittee;
    };
    reviewers(){
        return this._programCommittee;
    };
    addReviewer(user){
        this._programCommittee.push(user);
    }
    canSubmit(paper){
        if (this.stage() == "Receiving" )
            return paper.isValid();
        else 
            return false;
    }
    submit(paper){
        if (!this.canSubmit(paper)) throw new Error("Cannot submit invalid paper");
        
        if (this.stage() == "Receiving" )
            this._papers.push(paper);
        else
            throw new Error("Cannot submit papers at this stage");
    }
    papers(){
        return this._papers;
    }
    bids(){
        return this._bids;
    }
    stage(){
        return this._stage;
    }
    setStage(stage){
        this._stage = stage;
    }
    closeSubmissions(){
        this.setStage("Bidding");
    }
    enterBid(paper, reviewer, interest){
        if (this.stage() == "Bidding" )
            if(this.bidExistsFor(paper, reviewer)){
                let existing =  this.bidFor(paper, reviewer);
                existing.setInterest(interest);
            }
            else{
                let bid = new Bid(paper, reviewer, interest);
                this._bids.push(bid);
            }
        else
            throw new Error("Cannot enter bids from the current stage.");
    }
    bidExistsFor(paper, reviewer){
        return typeof(this.bidFor(paper, reviewer)) != "undefined";
    }
    bidFor(paper, reviewer){
        return this._bids.find( (suspect) => (suspect.paper() == paper) && (suspect.reviewer()==reviewer) );
    }
    interestFor(paper, reviewer){
        return this.bidFor(paper, reviewer).interest();
    }
}

module.exports = Session;