import Ember from 'ember';
import { test } from 'ember-qunit';
import '../helpers/define-fixture';
import testHelper from '../test-helper';

QUnit.module("Quick Jump", testHelper);

test("Search results", function(assert) {
  defineFixture('GET', '/quick_jumps', { params: { q: 'example' }, response: {
    "responses": [
      {
        "hits": {
          "hits": [{
            "_index": "client-contacts",
            "_type": "contact",
            "_score": 5,
            "_source": {
              "name": "Example Client Contact",
              "account_name": "Example Account Name"
            }
          }]
        }
      },
      {
        "hits": {
          "hits": [{
            "_index": "client-entities",
            "_type": "entity",
            "_score": 1,
            "_source": {
              "name": "Example Client Entity"
            }
          }]
        }
      },
      {
        "hits": {
          "hits": [{
            "_index": "client-accounts",
            "_type": "account",
            "_score": 10,
            "_source": {
              "name": "Example Client Account"
            }
          }]
        }
      },
      {
        "hits": {
          "hits": [{
            "_index": "advisors",
            "_type": "advisor",
            "_score": 4,
            "_source": {
              "name": "Example Advisor",
              "best_position": "Example Best Position"
            }
          }]
        }
      },
      {
        "hits": {
          "hits": [{
            "_index": "projects",
            "_type": "project",
            "_score": 2,
            "_source": {
              "codename": "Example Project",
              "external_title": "Example External Title"
            }
          }]
        }
      },
      {
        "hits": {
          "hits": [{
            "_index": "users",
            "_type": "user",
            "_score": 11,
            "_source": {
              "name": "Example User",
              "team_name": "Example Team Name"
            }
          }]
        }
      }
    ]
  }});

  defineFixture('GET', '/users/me', { response: {
    "user": {
      "id": 6565427,
      "name": "Sarah Saltz",
      "time_zone": "America/New_York",
      "initials": "SSa",
      "team_id": 136
    }
  }});

  defineFixture('GET', '/teams', { response: {
    "teams": [
      {
        "name" : "NYSC18 - The McKountry Klub",
        "id": 136,
        "office": "New York"
      }
    ]
  }});

  visit('/');
  click('.quick-jump .bar input');
  fillIn('.quick-jump .bar input', 'example');

  andThen(function() {
    var sections = find('.quick-jump .results section').toArray().map(function(section) {
      var $section = $(section);

      return {
        title: $section.find('> .title').text().trim(),

        results: $section
          .find('article')
          .toArray()
          .map(function(article) {
            var $article = $(article);

            return {
              title: $article.find('.title').text().trim(),
              details: $article.find('.details').text().trim()
            };
          })
      };
    });

    assert.deepEqual(sections, [
      {
        title: 'Top Hit - User',

        results: [{
          title: 'Example User',
          details: 'Example Team Name'
        }]
      }, {
        title: 'Colleagues',

        results: [{
          title: 'Example User',
          details: 'Example Team Name'
        }]
      }, {
        title: 'Contacts',

        results: [{
          title: 'Example Client Contact',
          details:'Example Account Name'
        }]
      }, {
        title: 'Advisors',

        results: [{
          title: 'Example Advisor',
          details:'Example Best Position'
        }]
      }, {
        title: 'Projects',
        results: [{
          title: 'Example Project',
          details:'Example External Title'
        }]
      }, {
        title: 'Entities',

        results: [{
          title: 'Example Client Entity',
          details: ''
        }]
      }, {
        title: 'Accounts',

        results: [{
          title: 'Example Client Account',
          details: ''
        }]
      }]
    );
  });
});

test("Empty search results", function(assert) {
  defineFixture('GET', '/quick_jumps', { params: { q: 'example' }, response: {
    "responses": {
      "hits": {
        "hits": []
      }
    }
  }});

  defineFixture('GET', '/users/me', { response: {
    "user": {
      "id": 6565427,
      "name": "Sarah Saltz",
      "time_zone": "America/New_York",
      "initials": "SSa",
      "team_id": 136
    }
  }});

  defineFixture('GET', '/teams', { response: {
    "teams": [
      {
        "name" : "NYSC18 - The McKountry Klub",
        "id": 136,
        "office": "New York"
      }
    ]
  }});

  visit('/');
  click('.quick-jump .bar input');
  fillIn('.quick-jump .bar input', 'example');

  andThen(function() {
    assert.equal($('.quick-jump .results strong').text().trim(), 'Your search did not match any documents.');
  });
});
