const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");

let session, author, r1, r2, r3;

function buildSession(paperCount) {
    const s = new Session();
    author = new User("Author", "Uni", "a@u.com", "pass");
    r1 = new User("R1", "Uni", "r1@u.com", "pass");
    r2 = new User("R2", "Uni", "r2@u.com", "pass");
    r3 = new User("R3", "Uni", "r3@u.com", "pass");
    [r1, r2, r3].forEach(r => s.addReviewer(r));
    const ps = [];
    for (let i = 0; i < paperCount; i++) {
        const p = new Paper(`Paper ${i}`, [author], author);
        s.submit(p);
        ps.push(p);
    }
    s.closeSubmissions();
    s.closeAndAssign();
    return { s, ps };
}

describe("Paper selection", () => {
    it("should select top papers by score up to the acceptance percentage", () => {
        const { s, ps } = buildSession(4);
        // Añade reseñas para diferenciar las puntuaciones
        ps.forEach((p, i) => {
            const [rv1, rv2, rv3] = s.assignmentsFor(p);
            const score = i - 1; // -1, 0, 1, 2
            s.addReview(p, rv1, "Review", Math.max(-3, Math.min(3, score)));
        });
        s.closeReviewing();
        s.setAcceptancePercentage(50); // acepta dos de cuatro
        const accepted = s.selectPapers();
        expect(accepted).toHaveLength(2);
        // selecciona los dos trabajos con mayor puntuación
        expect(accepted).toContain(ps[3]); 
        expect(accepted).toContain(ps[2]); 
    });

    it("should return no papers if percentage is 0", () => {
        const { s, ps } = buildSession(2);
        s.closeReviewing();
        s.setAcceptancePercentage(0);
        expect(s.selectPapers()).toHaveLength(0);
    });

    it("should return all papers if percentage is 100", () => {
        const { s, ps } = buildSession(3);
        s.closeReviewing();
        s.setAcceptancePercentage(100);
        expect(s.selectPapers()).toHaveLength(3);
    });

    it("should not allow selection outside the Selection stage", () => {
        const { s } = buildSession(1);
        expect(() => s.selectPapers()).toThrow();
    });

    it("should reject invalid acceptance percentages", () => {
        const { s } = buildSession(1);
        expect(() => s.setAcceptancePercentage(-1)).toThrow();
        expect(() => s.setAcceptancePercentage(101)).toThrow();
    });

    it("should use floor when percentage doesn't yield a whole number", () => {
        
        const { s } = buildSession(3);
        s.closeReviewing();
        s.setAcceptancePercentage(34);
        expect(s.selectPapers()).toHaveLength(1);
    });
});
