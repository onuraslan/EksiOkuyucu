
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/topiclist',
  'collections/topic',
  'text!templates/topic.html',
  'helpers/nav',
  'views/entry'
], function ($, _, Backbone, TopicListCollection,
             TopicCollection, TopicTemplate, NavHelper,
             EntryView) {

  var TopicListView = Backbone.View.extend ({
    el: '#main',

    // index of current item
    current_item: 0,
    current_topics: false,

    initialize: function () {
      this.topicListCollection = new TopicListCollection ();
      this.topicCollection = new TopicCollection ();
      
      NavHelper.initialize ('');
      // FIXME: refresh is binding but button is not showing, no idea why
      NavHelper.bindRefresh (this);
    },

    setTitle: function (external_url) {
      var user;
      if (user = external_url.match (/basliklar\/istatistik\/(.*?)\/son-entryleri/)) {
        NavHelper.setTitle (user[1] + '\'in son entryleri');
      } else if (user = external_url.match (/basliklar\/istatistik\/(.*?)\/favori-entryleri/)) {
        NavHelper.setTitle (user[1] + '\'in favori entryleri');
      } else if (user = external_url.match (/basliklar\/istatistik\/(.*?)\/en-begenilenleri/)) {
        NavHelper.setTitle (user[1] + '\'in en beğenilen entryleri');
      } else if (user = external_url.match (/basliklar\/istatistik\/(.*?)\/favorilenen-entryleri/)) {
        NavHelper.setTitle (user[1] + '\'in en çok favorilenen entryleri');
      } else if (user = external_url.match (/basliklar\/istatistik\/(.*?)\/son-oylananlari/)) {
        NavHelper.setTitle (user[1] + '\'in son oylanan entryleri');
      }

    },

    render: function (external_url) {

      var that = this;

      if (this.isLoading)
        return;

      this.isLoading = true;

      if (!this.current_topics) {

        this.setTitle (external_url);

        this.topicListCollection.external_url = external_url;

        this.topicListCollection.fetch ({

          success: function (entries) {

            that.isLoading = false;
            that.render ();

          }

        });

        this.current_topics = true;
        return;

      }


      this.topicCollection.reset ();

      if (!this.topicListCollection.at (this.current_item))
        return;

      this.topicCollection.external_url =
          this.topicListCollection.at (this.current_item).get ('url');

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


    events: {
      'scroll': 'checkScroll'
    },


    checkScroll: function () {
      if (!this.isLoading &&
          this.current_item < this.topicListCollection.length &&
          this.el.scrollTop + this.el.clientHeight + 200 >
          this.el.scrollHeight) {
        this.render ();
      }
    },


    refresh: function () {
      $(this.el).html ('');
      this.topicListCollection.reset ();
      this.topicCollection.reset ();
      this.current_topics = false;
      this.current_item = 0;
      this.render (this.topicListCollection.external_url);
    },


  });

  return TopicListView;

});
