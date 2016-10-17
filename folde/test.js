/**
 * Created by Rentala on 16-10-2016.
 */
var assert = require('assert');
var chai = require('chai');
var expect  = require("chai").expect;
var request = require("request");
chaiHttp = require('chai-http');
chai.use(chaiHttp);

//Note: prereq - user needs to be signed in
describe('Shopping', function() {

    var signin = "http://localhost:4000"
    it("sign in", function(done) {
        chai.request(signin)
            .post('/auth/signinUser')
            .send({"email":"acer@acer.com", "password" : "password" })
            .end(function (err, res) {
                console.log(res.body)
                assert.notEqual(res.text.indexOf("ebay"), -1);
                done();
            });
    });

    var homeurl = "http://localhost:4000/";
    it("returns status 200", function(done) {
        request(homeurl, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    var produrl = "http://localhost:4000/shopping/product/31";
    it("returns a specific product 200", function(done) {
        request(produrl, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    var fakeurl = "http://localhost:4000/random";
    it("returns 404 page not found", function(done) {
        request(fakeurl, function(error, response, body) {
            assert.notEqual(response.body.indexOf("Not Found"), -1);
            done();
        });
    });

    var fashionurl = "http://localhost:4000/shopping/category/Fashion";
    it("returns products of fashion category. Total count 4", function(done) {
        request(fashionurl, function(error, response, body) {
            var resp = JSON.parse(response.body);
            expect(resp.rows.length).to.equal(4);
            done();
        });
    });

    var url = "http://localhost:4000/user/24";
    it("Check if user page loads", function(done) {
        request(url, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

});