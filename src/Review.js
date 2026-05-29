class Review{
    constructor(reviewer, text, score){
        this._reviewer = reviewer;
        this._text = text;
        this._score = score;
    }
    reviewer(){
        return this._reviewer;
    }
    text(){
        return this._text;
    }
    score(){
        return this._score;
    }

}

module.exports = Review;