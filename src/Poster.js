const Paper = require("./Paper");

class Poster extends Paper{
    constructor(title, authors, correspondingAuthor, attachmentUrl, sourcesUrl){
        super(title, authors, correspondingAuthor);
        this._attachmentUrl = attachmentUrl;
        this._sourcesUrl = sourcesUrl;
    }
    attachmentUrl(){
        return this._attachmentUrl;
    }
    sourcesUrl(){
        return this._sourcesUrl;
    }
}

module.exports = Poster;
