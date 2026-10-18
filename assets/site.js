'use strict';
// Public website interactions only. No analytics, cookies, remote scripts or storage.
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menuButton = $('#menu-toggle');
  const menu = $('#main-navigation');
  const closeMenu = () => { if (!menuButton) return; menuButton.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); };
  menuButton?.addEventListener('click', () => { const expanded = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(expanded)); menu.classList.toggle('is-open', expanded); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.classList.contains('is-open')) { closeMenu(); menuButton.focus(); } });
  $$('#main-navigation a').forEach(link => link.addEventListener('click', closeMenu));
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const dialog = $('#launch-notice');
  const dialogHeading = $('#notice-heading');
  const dialogText = $('#notice-text');
  const dialogValue = $('#notice-value');
  let previousFocus;
  $$('[data-launch]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); previousFocus = link;
    const install = link.dataset.launch === 'install';
    dialogHeading.textContent = install ? 'The install link is being finalised.' : 'Pro checkout is being finalised.';
    dialogText.textContent = install ? 'The official extension listing needs to be added before you can install ClipBell here.' : 'Pro prices are set. Checkout is being finalised, so purchases are not open on this website yet.';
    dialogValue.textContent = 'Coming soon';
    dialog.showModal();
  }));
  $('#notice-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => previousFocus?.focus());
  dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close(); }});

  // Demo topic switches replace clearly labelled fictional result illustrations.
  const sampleData = {
    movies: [
      ['cinema','The next big adventure · Official trailer','Movie trailer · Sample result','2:18','Free to watch','free'],
      ['podcast','Behind the scenes · Cast conversation','Interview · Sample result','24:10','Not sure','unsure'],
      ['new','A new chapter · Full episode','Show · Sample result','42:00','Subscription · Platform name','subscription']
    ],
    cricket: [
      ['sport','India cricket · Match highlights','Cricket highlights · Sample result','8:24','Free to watch','free'],
      ['podcast','After the match · Team interview','Interview · Sample result','12:06','Free to watch','free'],
      ['sport','The cricket season · Weekly show','Sports show · Sample result','36:20','Subscription · Platform name','subscription']
    ],
    tech: [
      ['tech','Wireless earbuds · Launch event','Tech launch · Sample result','18:42','Free to watch','free'],
      ['tech','A closer look · New device interview','Interview · Sample result','14:30','Not sure','unsure'],
      ['new','The next release · Product overview','Tech video · Sample result','5:18','Free to watch','free']
    ],
    podcasts: [
      ['podcast','The curious mind · New conversation','Podcast · Sample result','48:12','Free to watch','free'],
      ['music','Inside the studio · New episode','Podcast · Sample result','35:18','Subscription · Platform name','subscription'],
      ['new','One good question · Weekly episode','Podcast · Sample result','22:04','Not sure','unsure']
    ]
  };
  const demoTabs = $$('[data-demo-topic]');
  const changeDemo = (button, focus = false) => {
    demoTabs.forEach(tab => { const chosen=tab === button; tab.setAttribute('aria-selected',String(chosen));tab.tabIndex=chosen?0:-1; });
    const rows = $$('.video-card', $('#demo-results'));
    sampleData[button.dataset.demoTopic].forEach((data,index)=>{
      const row=rows[index]; $('.thumb',row).className='thumb '+data[0]; $('h3',row).textContent=data[1]; $('.video-copy p',row).textContent=data[2]; $('.time',row).textContent=data[3]; $('.tag',row).textContent=data[4]; $('.tag',row).className='tag '+(data[5]==='free'?'':'tag-'+data[5]);
    });
    $('#demo-results').setAttribute('aria-labelledby',button.id);
    if(focus)button.focus();
  };
  demoTabs.forEach((button,index)=>{
    button.addEventListener('click',()=>changeDemo(button));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%demoTabs.length;
      if(event.key==='ArrowLeft')next=(index-1+demoTabs.length)%demoTabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=demoTabs.length-1;
      if(next!==undefined){event.preventDefault();changeDemo(demoTabs[next],true);}
    });
  });

  const currency = $('#currency');
  const priceNode = $('#pro-price');
  let billing = 'monthly';
  const formatPrice = (cur, raw) => {
    const amount = Number(raw);
    if (cur === 'INR') return '₹' + amount.toLocaleString('en-IN', {maximumFractionDigits: 0});
    return '$' + (Number.isInteger(amount) ? String(amount) : amount.toFixed(2));
  };
  const suffixes = {
    monthly: {INR: ' + GST / month', USD: ' / month'},
    yearly: {INR: ' + GST / year', USD: ' / year'},
    lifetime: {INR: ' + GST · one-time', USD: ' · one-time'}
  };
  const notes = {
    monthly: {INR: 'Monthly plan · India pricing. Indian buyers pay 18% GST on top.', USD: 'Monthly plan · outside India. No GST outside India.'},
    yearly: {INR: 'Yearly plan · 2 months free (10 months’ price). Indian buyers pay 18% GST on top.', USD: 'Yearly plan · 2 months free (10 months’ price). No GST outside India.'},
    lifetime: {INR: 'Founder lifetime, limited to the first 1,000 users. One-time payment. Indian buyers pay 18% GST on top.', USD: 'Founder lifetime, limited to the first 1,000 users. One-time payment. No GST outside India.'}
  };
  const updatePrice = () => {
    if (!priceNode) return;
    const cur = currency.value;
    const key = billing + (cur === 'INR' ? 'Inr' : 'Usd');
    priceNode.classList.remove('pending');
    priceNode.replaceChildren();
    priceNode.append(document.createTextNode(formatPrice(cur, priceNode.dataset[key])));
    const suffix = document.createElement('small'); suffix.textContent = suffixes[billing][cur]; priceNode.append(suffix);
    $('#pro-price-note').textContent = notes[billing][cur];
    $$('[data-billing]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.billing===billing)));
    $('#free-price').firstChild.textContent=cur==='INR'?'₹0':'$0';
  };
  currency?.addEventListener('change',updatePrice);
  $$('[data-billing]').forEach(button=>button.addEventListener('click',()=>{billing=button.dataset.billing;updatePrice();}));

  const faqSearch=$('#faq-search');
  faqSearch?.addEventListener('input',()=>{
    const query=faqSearch.value.toLocaleLowerCase().trim();let count=0;
    $$('[data-faq]').forEach(item=>{const show=item.textContent.toLocaleLowerCase().includes(query);item.hidden=!show;if(show)count++;});
    $('#faq-count').textContent=count+' '+(count===1?'answer':'answers');
    $('#faq-empty').hidden=count!==0;
  });

  const contactForm=$('#contact-form');
  contactForm?.addEventListener('submit',event=>{
    event.preventDefault();if(!contactForm.reportValidity())return;
    const name=$('#contact-name').value.trim(),email=$('#contact-email').value.trim(),message=$('#contact-message').value.trim();
    if(!name||!email||!message){$('#form-status').hidden=false;$('#form-status').textContent='Please enter your name, email address and message.';return;}
    const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;
    const target=`mailto:support@clipbell.com?subject=${encodeURIComponent('ClipBell support request')}&body=${encodeURIComponent(body)}`;
    $('#form-status').hidden=false;
    $('#form-status').textContent='Your email draft is ready to open. Nothing has been sent by this website. Review and send it from your email app, or email support@clipbell.com directly.';
    const fallback=$('#email-draft-link');fallback.href=target;fallback.hidden=false;
    window.location.href=target;
  });

  const searchForm=$('#site-search-form');
  if(searchForm){
    const input=$('#site-search');const query=new URLSearchParams(location.search).get('q')||'';input.value=query;
    let index;
    const runSearch=async()=>{
      const q=input.value.trim();const results=$('#search-results'),status=$('#search-status');results.replaceChildren();
      if(!q){status.textContent='Type a word or question to search the ClipBell website.';return;}
      status.textContent='Searching ClipBell pages…';
      try{
        if(!index){const response=await fetch('/assets/search-index.json',{credentials:'omit'});if(!response.ok)throw new Error('Search index unavailable');index=await response.json();}
        const tokens=q.toLocaleLowerCase().split(/\s+/).filter(Boolean).slice(0,20);
        const matches=index.map(page=>{const title=page.title.toLocaleLowerCase(),text=page.text.toLocaleLowerCase();return {...page,score:tokens.reduce((sum,token)=>sum+(title.includes(token)?4:0)+(text.includes(token)?1:0),0)};}).filter(page=>page.score>0).sort((a,b)=>b.score-a.score);
        status.textContent=matches.length?`${matches.length} ${matches.length===1?'page':'pages'} found for “${q}”.`:`No pages found for “${q}”. Try “PIN”, “pricing”, “privacy” or “alerts”.`;
        matches.forEach(page=>{
          const article=document.createElement('article');article.className='search-result';
          const url=document.createElement('p');url.className='search-url';url.textContent='clipbell.com'+page.path;
          const h=document.createElement('h2'),a=document.createElement('a');a.href=page.path;a.textContent=page.title;h.append(a);
          const description=document.createElement('p');description.textContent=page.description;article.append(url,h,description);results.append(article);
        });
      }catch{status.textContent='Website search could not load. Please use the page links below or contact support.';}
    };
    searchForm.addEventListener('submit',event=>{event.preventDefault();const url=new URL(location.href);url.searchParams.set('q',input.value.trim());history.replaceState(null,'',url);runSearch();});
    runSearch();
  }
})();
