const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");
const { Interests } = require("../src/Bid");

let session;
let r1, r2, r3, r4, r5, r6, r7;
let a1, a2;
let papers;

beforeEach(() => {
    session = new Session();
    // revisores
    r1 = new User("R1", "Uni", "r1@u.com", "pass");
    r2 = new User("R2", "Uni", "r2@u.com", "pass");
    r3 = new User("R3", "Uni", "r3@u.com", "pass");
    r4 = new User("R4", "Uni", "r4@u.com", "pass");
    r5 = new User("R5", "Uni", "r5@u.com", "pass");
    r6 = new User("R6", "Uni", "r6@u.com", "pass");
    r7 = new User("R7", "Uni", "r7@u.com", "pass");
    // autores  
    a1 = new User("A1", "Uni", "a1@u.com", "pass");
    a2 = new User("A2", "Uni", "a2@u.com", "pass");

    [r1, r2, r3, r4, r5, r6, r7].forEach(r => session.addReviewer(r));
});

function submitPapers(n) {
    const ps = [];
    for (let i = 0; i < n; i++) {
        const p = new Paper(`Paper ${i}`, [a1, a2], a1);
        session.submit(p);
        ps.push(p);
    }
    return ps;
}

describe("Reviewer assignment — basics", () => {
    it("should assign exactly 3 reviewers per paper", () => {
        const ps = submitPapers(3);
        session.closeSubmissions();
        session.closeAndAssign();
        ps.forEach(p => expect(session.assignmentsFor(p)).toHaveLength(3));
    });

    it("should transition to Reviewing stage after assignment", () => {
        submitPapers(1);
        session.closeSubmissions();
        session.closeAndAssign();
        expect(session.stage()).toBe("Reviewing");
    });

    it("should not allow closeAndAssign outside Bidding stage", () => {
        expect(() => session.closeAndAssign()).toThrow();
    });
});

describe("Reviewer assignment — distribution (⌈3A/R⌉)", () => {
    it("should distribute 10 papers among 7 reviewers correctly (2 do 5, 5 do 4)", () => {
        const ps = submitPapers(10);
        session.closeSubmissions();
        session.closeAndAssign();

        const counts = new Map([r1, r2, r3, r4, r5, r6, r7].map(r => [r, 0]));
        ps.forEach(p => {
            session.assignmentsFor(p).forEach(r => counts.set(r, counts.get(r) + 1));
        });

        const values = [...counts.values()].sort((a, b) => a - b);
       
        expect(values.filter(v => v === 5)).toHaveLength(2);
        expect(values.filter(v => v === 4)).toHaveLength(5);
    });

    it("should distribute 3 papers among 3 reviewers (each gets 3)", () => {
        const s = new Session();
        [r1, r2, r3].forEach(r => s.addReviewer(r));
        const ps = [];
        for (let i = 0; i < 3; i++) {
            const p = new Paper(`P${i}`, [a1], a1);
            s.submit(p);
            ps.push(p);
        }
        s.closeSubmissions();
        s.closeAndAssign();

        const counts = new Map([r1, r2, r3].map(r => [r, 0]));
        ps.forEach(p => s.assignmentsFor(p).forEach(r => counts.set(r, counts.get(r) + 1)));
        counts.forEach(v => expect(v).toBe(3));
    });
});

describe("Reviewer assignment — bid priority", () => {
    it("should prefer Interested reviewers over Maybe", () => {
        const s = new Session();
        [r1, r2, r3].forEach(r => s.addReviewer(r));
        const p = new Paper("Test Paper", [a1], a1);
        s.submit(p);
        s.closeSubmissions();
        s.enterBid(p, r1, Interests.NotInterested);
        s.enterBid(p, r2, Interests.Maybe);
        s.enterBid(p, r3, Interests.Interested);
        s.closeAndAssign();
        const assigned = s.assignmentsFor(p);
       
        expect(assigned).toContain(r3);
    });

    it("should fill remaining slots with Maybe if not enough Interested", () => {
        const s = new Session();
        [r1, r2, r3].forEach(r => s.addReviewer(r));
        const p = new Paper("Test Paper", [a1], a1);
        s.submit(p);
        s.closeSubmissions();
        s.enterBid(p, r1, Interests.Interested);
        s.enterBid(p, r2, Interests.Maybe);
   
        s.closeAndAssign();
        const assigned = s.assignmentsFor(p);
        expect(assigned).toContain(r1);
        expect(assigned).toContain(r2);
        expect(assigned).toContain(r3);
    });
});

describe("Reviewer assignment — conflict of interest", () => {
    it("should not assign a reviewer who is an author of the paper", () => {
     
        const s = new Session();
        [r1, r2, r3, r4].forEach(r => s.addReviewer(r));
        // r1 es revisor y autor
        const p = new Paper("Conflict Paper", [r1, a1], r1);
        s.submit(p);
        s.closeSubmissions();
        s.closeAndAssign();
        // r2, r3, r4 deben ser asignados; r1 no debe serlo
        expect(s.assignmentsFor(p)).not.toContain(r1);
        expect(s.assignmentsFor(p)).toHaveLength(3);
    });
});
