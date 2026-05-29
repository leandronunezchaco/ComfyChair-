class Conference{
    constructor(name){
        this._name = name;
        this._chairs = [];
        this._sessions = [];
    }
    name(){
        return this._name;
    }
    chairs(){
        return this._chairs;
    }
    sessions(){
        return this._sessions;
    }
    addChair(user){
        this._chairs.push(user);
    }
    addSession(session){
        this._sessions.push(session);
    }
}

module.exports = Conference;
