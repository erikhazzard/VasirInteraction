from django.conf.urls.defaults import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'veinterface.views.home', name='home'),
    # url(r'^veinterface/', include('veinterface.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    #-------------------------------------------------------------------------
    #Base PAges
    #-------------------------------------------------------------------------
    #Home
    url(r'^$', 'engine.views.page_home', 
        name='home'),

    #-------------------------------------------------------------------------
    #Interface Functions
    #-------------------------------------------------------------------------
    #Create an entity
    url(r'^create_entity[/]$', 'engine.views.send_message', 
        {
            'message': 'create_entity',
        },),

    #Get all entities
    url(r'^get_entities[/]$', 'engine.views.send_message', 
        {
            'message': 'get_entities', 
        },),

    #------------------------------------
    #Entity Actions
    #------------------------------------
    #Get entity info
    url(r'^get_entity_info/(?P<entity_id>.*)/$', 'engine.views.get_entity_info', 
        name='get_info'),
    #Set target
    url(r'^set_entity_target/(?P<source_entity_id>.*)/(?P<target_entity_id>.*)/$', 
        'engine.views.set_entity_target', 
        ),
    #Converse
    url(r'^converse/(?P<source_entity_id>.*)/$', 
        'engine.views.converse', 
        ),

)

if settings.DEBUG:
    urlpatterns += patterns('',
    (r'^static/(?P<path>.*)$',
        'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    )

