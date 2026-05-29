const RegularPaper = require("../src/RegularPaper");
const User = require('../src/User');

beforeEach( ()=> {
    juan = new User("Juan Gardey", "LIFIA, UNLP", "jgardey@lifia.ar", "123");
    julian = new User("Julián Grigera", "LIFIA, UNLP", "jgrigera@lifia.ar", "123");
    matias = new User("Matias Urbieta", "LIFIA, UNLP", "murbieta@lifia.ar", "123");
    paper01 = new RegularPaper("A new approach on something", [juan, julian], juan, "Lorem Ipsum dolor sit amet");
});

describe("A new RegularPaper", ()=>{
    it("should have an abstract", ()=>{
        let newPaper = new RegularPaper("An approach on something", [juan, matias, julian], juan, "Lorem ipsum");
        expect(newPaper.abstract()).not.toBe('');
    });
    it("should have its corresponding author amongst its list of authors", ()=>{
        let validPaper, invalidPaper;
        valid = ()=>{ validPaper = new RegularPaper("An approach on something", [juan, matias], juan, "Lorem ipsum");}
        invalid = ()=>{ invalidPaper = new RegularPaper("An approach on something", [juan, matias], julian, "Lorem ipsum");}
        expect(valid).not.toThrow();
        expect(invalid).toThrow();
    })
})

describe("A RegularPaper", ()=>{
    it("should only be valid if there are authors, title and <300 words abstract", ()=>{
        expect(paper01.isValid()).toBeTrue;
    });
    it("should be invalid if the abstract exceeds 300 words", ()=>{
        let abstract = "";
        for (i=0; i<300; i++) {
            abstract += "word "
        };
        paper01.setAbstract(abstract)
        expect(paper01.isValid()).toBe(true);
        abstract += "word ";
        paper01.setAbstract(abstract)
        expect(paper01.isValid()).toBe(false);
    });

})
