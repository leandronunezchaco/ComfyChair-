const { Bid, Interests } = require("../src/Bid");
const Paper = require("../src/Paper");
const User = require("../src/User");

let juan, julian;
let paper01;
let bid;

beforeEach( ()=> {
    juan = new User("Juan Gardey", "LIFIA, UNLP", "jgardey@lifia.ar", "123");
    julian = new User("Julián Grigera", "LIFIA, UNLP", "jgrigera@lifia.ar", "123");
    paper01 = new Paper("A new approach on something", [juan, julian], juan);
    bid = new Bid(paper01, julian, Interests.Interested);
});

describe("A new Bid", ()=>{
    it("should know its paper", ()=>{
        expect(bid.paper()).toBe(paper01);
    });
    it("should know its reviewer", ()=>{
        expect(bid.reviewer()).toBe(julian);
    });
    it("should know its interest level", ()=>{
        expect(bid.interest()).toBe(Interests.Interested);
    });
});

describe("A Bid", ()=>{
    it("should allow changing the interest level", ()=>{
        bid.setInterest(Interests.Maybe);
        expect(bid.interest()).toBe(Interests.Maybe);
    });
    it("should support all interest levels", ()=>{
        bid.setInterest(Interests.NotInterested);
        expect(bid.interest()).toBe(Interests.NotInterested);
        bid.setInterest(Interests.Maybe);
        expect(bid.interest()).toBe(Interests.Maybe);
        bid.setInterest(Interests.Interested);
        expect(bid.interest()).toBe(Interests.Interested);
    });
});
