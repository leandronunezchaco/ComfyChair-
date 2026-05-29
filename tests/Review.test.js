const Session = require("../src/Session");
const User = require("../src/User");
const Paper = require("../src/Paper");

let session, r1, r2, r3, author, paper;

beforeEach(() => {
    session = new Session();
    author = new User("Author", "Uni", "author@u.com", "pass");
    r1 = new User("R1", "Uni", "r1@u.com", "pass");
    r2 = new User("R2", "Uni", "r2@u.com", "pass");
    r3 = new User("R3", "Uni", "r3@u.com", "pass");
    [r1, r2, r3].forEach(r => session.addReviewer(r));
    paper = new Paper("A paper", [author], author);
    session.submit(paper);
    session.closeSubmissions();
    session.closeAndAssign();
    // la sesión se encuentra ahora en fase de revisión
});

describe("Review loading", () => {
    it("should allow an assigned reviewer to submit a review", () => {
        const assigned = session.assignmentsFor(paper);
        expect(() => session.addReview(paper, assigned[0], "Good paper", 2)).not.toThrow();
        expect(paper.reviews()).toHaveLength(1);
    });

    it("should reject a review from a non-assigned reviewer", () => {
        //  busca un revisor que nO esté asignado al artículo. crea uno extra
        const extra = new User("Extra", "Uni", "extra@u.com", "pass");
        expect(() => session.addReview(paper, extra, "Meh", 0)).toThrow();
    });

    it("should reject scores outside −3 to +3", () => {
        const reviewer = session.assignmentsFor(paper)[0];
        expect(() => session.addReview(paper, reviewer, "Bad", 4)).toThrow();
        expect(() => session.addReview(paper, reviewer, "Bad", -4)).toThrow();
    });

    it("should accept boundary scores −3 and +3", () => {
        const [rev1, rev2] = session.assignmentsFor(paper);
        expect(() => session.addReview(paper, rev1, "Worst", -3)).not.toThrow();
        expect(() => session.addReview(paper, rev2, "Best", 3)).not.toThrow();
    });

    it("should reject reviews outside the Reviewing stage", () => {
        const reviewer = session.assignmentsFor(paper)[0];
        session.closeReviewing();
        expect(() => session.addReview(paper, reviewer, "Late", 1)).toThrow();
    });

    it("should not allow more than 3 reviews per paper", () => {
        const [rev1, rev2, rev3] = session.assignmentsFor(paper);
        session.addReview(paper, rev1, "Review 1", 1);
        session.addReview(paper, rev2, "Review 2", 2);
        session.addReview(paper, rev3, "Review 3", 3);
        // crea otro documento y revisor para evitar el error no asignado. la propia clase paper impone el límite
        expect(() => paper.addReview(rev1, "Extra", 0)).toThrow();
    });
});
