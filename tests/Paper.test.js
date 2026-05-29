const Paper = require("../src/Paper");
const Review = require("../src/Review");
const User = require("../src/User");

let paper;
let juan, julian, matias;
jest.mock("../src/User");

beforeEach(()=>{
    juan = new User();
    julian = new User();
    matias = new User();
    paper = new Paper("A Systematic Literature Review",[juan, matias],juan);
});

describe("A Paper", ()=>{
    it("should receive up to 3 reviews", ()=>{
        paper.addReview(julian, "Paper is terrible", -3);
        expect(paper.reviews()).toHaveLength(1);
        paper.addReview(julian, "Paper is bad", -2);
        paper.addReview(matias, "Paper is awesome", 3);
        let invalidReview = ()=>{paper.addReview(matias, "Paper is meh", 0);}
        expect(invalidReview).toThrow();
    })
    it("score should be the score average of its reviews", ()=>{
        expect(paper.score()).toBe(0);
        paper.addReview(juan, "Paper is terrible", -3);
        expect(paper.score()).toBe(-3);
        paper.addReview(julian, "Paper is bad", -2);
        expect(paper.score()).toBe(-2.5);
        paper.addReview(matias, "Paper is awesome", 3);
        expect(paper.score()).toBeCloseTo(-0.66666);
    })
})