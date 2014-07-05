
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/debe',
  'collections/topic',
  'text!templates/topic.html',
  'helpers/nav',
  'views/entry'
], function ($, _, Backbone, DebeCollection,
             TopicCollection, TopicTemplate,
             NavHelper, EntryView) {

  var DebeView = Backbone.View.extend ({
    el: '#main',

    current_item: 0,
    current_topics: false,

    initialize: function () {
      this.debeCollection = new DebeCollection ();
      this.topicCollection = new TopicCollection ();
      this.isLoading = false;
      
      NavHelper.initialize ('Dünün en beğenilen entryleri');
    },

    getEntry: function (entry_id) {

      var that = this;

      this.topicCollection.reset ();
      this.topicCollection.external_url = 'entry/' + entry_id;

      this.topicCollection.fetch ({
        success: function (entries) {

          that.isLoading = false;

          $(that.el).append (_.template (TopicTemplate,
               {
                 entry_title: that.topicCollection.title,
                 external_url: that.topicCollection.external_url,
                 entries: [ entries
                                .at (0)
                                .toJSON ()
                          ]
               }));

          if (!that.entryview) { new EntryView (); that.entryview = true; }

          that.current_item++;
          that.checkScroll ();

        }
      });

    },


    render: function () {

      var that = this;

      this.isLoading = true;

      if (!this.current_topics) {

        this.debeCollection.fetch ({
          success: function (entries) {
            that.isLoading = false;
            that.current_topics = true;
            that.render ();
          }

        });

        return;

      }

      this.getEntry (this.debeCollection.at (this.current_item).get ('eid'));

    },


    events: {
      'scroll': 'checkScroll'
    },


    checkScroll: function () {
      if (!this.isLoading &&
          this.current_item < this.debeCollection.length &&
          this.el.scrollTop + this.el.clientHeight + 200 >
          this.el.scrollHeight) {
        this.render ();
      }
    },

  });

  return DebeView;

});
