---
layout: page
title: Categories
permalink: /categories/
---

<div>
{% for category in site.categories %}
  <div class="archive-group">
    {% capture category_name %}{{ category | first }}{% endcapture %}
    {% assign category_slug = category_name | slugify %}
    <div id="{{ category_slug }}"></div>
    <p></p>
    <h3 class="category-head">{{ category_name }}</h3>
    <a name="{{ category_slug }}"></a>
    {% for post in site.categories[category_name] %}
    <article class="archive-item">
      <h4><a href="{{ post.url | relative_url }}">{{post.title}}</a></h4>
    </article>
    {% endfor %}
  </div>
{% endfor %}
</div>
