const Poster = require("../src/Poster");
const User = require('../src/User');

let juan, julian, matias;
let poster01;

beforeEach( ()=> {
    juan = new User("Juan Gardey", "LIFIA, UNLP", "jgardey@lifia.ar", "123");
    julian = new User("Julián Grigera", "LIFIA, UNLP", "jgrigera@lifia.ar", "123");
    matias = new User("Matias Urbieta", "LIFIA, UNLP", "murbieta@lifia.ar", "123");
    poster01 = new Poster(
        "A Visual Approach on Something",
        [juan, julian],
        juan,
        "https://example.com/poster.pdf",
        "https://example.com/sources.zip"
    );
});

describe("A new Poster", ()=>{
    it("should have its corresponding author amongst its list of authors", ()=>{
        const valid = ()=> new Poster("A poster", [juan, matias], juan, "https://example.com/p.pdf", "https://example.com/s.zip");
        const invalid = ()=> new Poster("A poster", [juan, matias], julian, "https://example.com/p.pdf", "https://example.com/s.zip");
        expect(valid).not.toThrow();
        expect(invalid).toThrow();
    });
});

describe("A Poster", ()=>{
    it("should have an attachment URL", ()=>{
        expect(poster01.attachmentUrl()).toBe("https://example.com/poster.pdf");
    });
    it("should have a sources URL", ()=>{
        expect(poster01.sourcesUrl()).toBe("https://example.com/sources.zip");
    });
    it("should be valid with title and at least one author", ()=>{
        expect(poster01.isValid()).toBe(true);
    });
    it("should be invalid without a title", ()=>{
        const noTitle = new Poster("", [juan], juan, "https://example.com/p.pdf", "https://example.com/s.zip");
        expect(noTitle.isValid()).toBe(false);
    });
});
