(function(){
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function showToast(message, tone) {
    var container = $('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (tone === 'error') {
      toast.style.background = '#c23b22';
    }
    container.appendChild(toast);
    requestAnimationFrame(function(){ toast.classList.add('show'); });
    setTimeout(function(){
      toast.classList.remove('show');
      setTimeout(function(){ container.removeChild(toast); }, 220);
    }, 3600);
  }

  function fetchJSON(url, options) {
    return fetch(url, Object.assign({ credentials: 'include' }, options || {}))
      .then(function(resp){
        if (!resp.ok) {
          var err = new Error('Request failed');
          err.status = resp.status;
          throw err;
        }
        return resp.json();
      });
  }

  function renderTracks(tracks) {
    var container = document.querySelector('[data-role="track-list"]');
    if (!container) return;
    container.innerHTML = '';
    tracks.forEach(function(track){
      var card = document.createElement('article');
      card.className = 'track-card';
      card.innerHTML = `
        <h4>${track.title}</h4>
        <p>${track.description || ''}</p>
        <ul class="track-card__modules"></ul>
        <span class="track-card__badge">${track.badge ? track.badge.name : 'Badge pending'}</span>
      `;
      var list = card.querySelector('.track-card__modules');
      (track.modules || []).forEach(function(mod){
        var li = document.createElement('li');
        li.textContent = mod.label + ' · ' + (mod.durationMinutes ? mod.durationMinutes + ' min' : 'self-paced');
        list.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderLabs(labs) {
    var container = document.querySelector('[data-role="lab-list"]');
    if (!container) return;
    container.innerHTML = '';
    labs.forEach(function(lab){
      var card = document.createElement('article');
      card.className = 'lab-card';
      card.innerHTML = `
        <h4>${lab.title}</h4>
        <p>${lab.scenario || ''}</p>
        <h5>Objectives</h5>
        <ul></ul>
        <h5>Model Highlights</h5>
        <ul data-role="model"></ul>
      `;
      var objectives = card.querySelector('ul');
      (lab.objectives || []).forEach(function(obj){
        var li = document.createElement('li');
        li.textContent = obj;
        objectives.appendChild(li);
      });
      var modelList = card.querySelector('[data-role="model"]');
      (lab.modelHighlights || []).forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item;
        modelList.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderCases(cases) {
    var container = document.querySelector('[data-role="case-list"]');
    if (!container) return;
    container.innerHTML = '';
    cases.forEach(function(entry){
      var card = document.createElement('article');
      card.className = 'case-card';
      card.innerHTML = `
        <h4>${entry.headline}</h4>
        <p>${entry.summary || ''}</p>
        <h5>Moderator Takeaways</h5>
        <ul></ul>
      `;
      var list = card.querySelector('ul');
      (entry.moderatorTakeaways || []).forEach(function(take){
        var li = document.createElement('li');
        li.textContent = take;
        list.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function formatPercent(value) {
    if (typeof value !== 'number') return 'n/a';
    return (value * 100).toFixed(1) + '%';
  }

  function renderSnapshots(snapshots) {
    var container = document.querySelector('[data-role="snapshot-list"]');
    if (!container) return;
    container.innerHTML = '';
    snapshots.forEach(function(snapshot){
      var card = document.createElement('article');
      card.className = 'snapshot-card';
      card.innerHTML = `
        <header>
          <h4>${snapshot.company} (${snapshot.symbol})</h4>
          <p>${snapshot.summary || ''}</p>
        </header>
        <div class="snapshot-card__metrics"></div>
        <ul></ul>
        <footer></footer>
      `;
      var metrics = card.querySelector('.snapshot-card__metrics');
      var ratios = snapshot.keyRatios || {};
      var metricMap = [
        { label: 'Dividend Yield', value: formatPercent(ratios.dividendYield) },
        { label: 'Payout Ratio', value: formatPercent(ratios.payoutRatio) },
        { label: '5Y CAGR', value: formatPercent(ratios.fiveYearCAGR) },
        { label: 'Net Debt / EBITDA', value: typeof ratios.netDebtToEBITDA === 'number' ? ratios.netDebtToEBITDA.toFixed(1) : 'n/a' }
      ];
      metricMap.forEach(function(metric){
        var metricEl = document.createElement('div');
        metricEl.className = 'snapshot-card__metric';
  metricEl.innerHTML = `<strong>${metric.label}</strong><div>${metric.value}</div>`;
        metrics.appendChild(metricEl);
      });
      var bullets = card.querySelector('ul');
      (snapshot.qualitativeBullets || []).forEach(function(bullet){
        var li = document.createElement('li');
        li.textContent = bullet;
        bullets.appendChild(li);
      });
      var footer = card.querySelector('footer');
      (snapshot.sources || []).forEach(function(source){
        var link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = source.label;
        link.style.marginRight = '12px';
        footer.appendChild(link);
      });
      container.appendChild(card);
    });
  }

  function renderBranches(branches) {
    var container = document.querySelector('[data-role="branch-list"]');
    if (!container) return;
    container.innerHTML = '';
    branches.forEach(function(branch){
      var card = document.createElement('article');
      card.className = 'branch-card';
      card.innerHTML = `
        <h4>${branch.title}</h4>
        <p>${branch.description || ''}</p>
        <ol class="branch-card__decisions"></ol>
      `;
      var list = card.querySelector('.branch-card__decisions');
      (branch.decisions || []).forEach(function(step){
        var item = document.createElement('li');
        item.textContent = 'Week ' + step.week + ': ' + step.action;
        list.appendChild(item);
      });
      container.appendChild(card);
    });
  }

  function renderMindful(dashboard) {
    var panel = document.querySelector('[data-role="mindful-panel"]');
    if (!panel) return;
    panel.innerHTML = '';

    var summary = document.createElement('div');
    summary.className = 'mindful-summary';
    summary.innerHTML = `
      <h4>Headline Mood: ${dashboard.sentimentHeat ? dashboard.sentimentHeat.headlineMood : 'n/a'}</h4>
      <p>AI Confidence: ${dashboard.sentimentHeat ? Math.round(dashboard.sentimentHeat.aiConfidence * 100) + '%' : 'n/a'}</p>
      <p>Hype Headlines Flagged: ${dashboard.sentimentHeat ? dashboard.sentimentHeat.hypeHeadlineCount : '0'}</p>
      <p>Cooldown Timer: ${dashboard.sentimentHeat ? dashboard.sentimentHeat.cooldownTimerMinutes + ' minutes' : 'Set yours'}</p>
    `;
    panel.appendChild(summary);

    var nudges = document.createElement('ul');
    (dashboard.nudges || []).forEach(function(nudge){
      var li = document.createElement('li');
      li.textContent = nudge;
      nudges.appendChild(li);
    });
    panel.appendChild(nudges);
  }

  function renderBriefings(briefings) {
    var container = document.querySelector('[data-role="briefing-list"]');
    if (!container) return;
    container.innerHTML = '';
    briefings.forEach(function(entry){
      var card = document.createElement('article');
      card.className = 'briefing-card';
      card.innerHTML = `
        <h4>Week of ${entry.week}</h4>
        <p>${entry.theme || ''}</p>
        <ul class="briefing-card__list"></ul>
      `;
      var list = card.querySelector('.briefing-card__list');
      (entry.highlights || []).forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderNotebook(notebook) {
    var panel = document.querySelector('[data-role="notebook-panel"]');
    if (!panel) return;
    panel.innerHTML = '';

    var prompts = document.createElement('div');
    prompts.className = 'notebook-prompts';
    var promptTitle = document.createElement('h4');
    promptTitle.textContent = 'Template Prompts';
    prompts.appendChild(promptTitle);
    var list = document.createElement('ul');
    (notebook.templatePrompts || []).forEach(function(prompt){
      var li = document.createElement('li');
      li.textContent = prompt;
      list.appendChild(li);
    });
    prompts.appendChild(list);
    panel.appendChild(prompts);

    var storage = document.createElement('p');
    var storageInfo = notebook.storage || {};
    storage.textContent = 'Storage: ' + (storageInfo.available ? 'Enabled (' + storageInfo.retentionDays + ' day retention)' : 'Planned');
    panel.appendChild(storage);
    if (storageInfo.exportOptions) {
      var exports = document.createElement('p');
      exports.textContent = 'Exports: ' + storageInfo.exportOptions.join(', ');
      panel.appendChild(exports);
    }
  }

  function renderTiers(tiers) {
    var container = document.querySelector('[data-role="tier-list"]');
    if (!container) return;
    container.innerHTML = '';
    tiers.forEach(function(tier){
      var card = document.createElement('article');
      card.className = 'tier-card';
      card.innerHTML = `
        <h4>${tier.label}</h4>
        <h5>Unlocks</h5>
        <ul class="tier-card__unlocks"></ul>
        <h5>Requirements</h5>
        <ul data-role="requirements"></ul>
      `;
      var unlockList = card.querySelector('.tier-card__unlocks');
      (tier.unlocks || []).forEach(function(unlock){
        var li = document.createElement('li');
        li.textContent = unlock;
        unlockList.appendChild(li);
      });
      var reqList = card.querySelector('[data-role="requirements"]');
      (tier.completionNeeds || []).forEach(function(req){
        var li = document.createElement('li');
        li.textContent = req;
        reqList.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderAudit(logs) {
    var container = document.querySelector('[data-role="audit-log"]');
    if (!container) return;
    container.innerHTML = '';
    logs.forEach(function(entry){
      var card = document.createElement('article');
      card.className = 'audit-card';
      var sourcesText = Array.isArray(entry.sources) && entry.sources.length ? entry.sources.join(', ') : 'n/a';
      card.innerHTML = `
        <h4>${entry.symbol} · ${entry.id}</h4>
        <div class="audit-card__meta">Timestamp: ${entry.timestamp}</div>
        <div class="audit-card__meta">Sources: ${sourcesText}</div>
      `;
      if (entry.filters && entry.filters.length) {
        var filters = document.createElement('div');
        filters.className = 'audit-card__meta';
        filters.textContent = 'Filters: ' + entry.filters.join(', ');
        card.appendChild(filters);
      }
      container.appendChild(card);
    });
  }

  function renderMentors(mentors) {
    var container = document.querySelector('[data-role="mentor-list"]');
    if (!container) return;
    container.innerHTML = '';
    mentors.forEach(function(mentor){
      var card = document.createElement('article');
      card.className = 'mentor-card';
      card.innerHTML = `
        <h4>${mentor.name}</h4>
        <p class="mentor-card__focus">Focus: ${mentor.focus}</p>
        <p>Voice: ${mentor.voice}</p>
      `;
      container.appendChild(card);
    });
  }

  function renderMyths(myths) {
    var container = document.querySelector('[data-role="myth-list"]');
    if (!container) return;
    container.innerHTML = '';
    myths.forEach(function(entry){
      var quiz = entry.quiz || { question: '', choices: [], answerIndex: null };
      var card = document.createElement('article');
      card.className = 'myth-card';
      card.innerHTML = `
        <h4>Myth</h4>
        <p>${entry.myth}</p>
        <h4>Reality</h4>
        <p>${entry.reality}</p>
        <div class="myth-card__quiz">
          <strong>Quick Check:</strong>
          <p>${quiz.question}</p>
          <ul></ul>
          <p><em>Answer index: ${quiz.answerIndex !== null ? quiz.answerIndex : 'n/a'}</em></p>
        </div>
      `;
      var options = card.querySelector('ul');
      (quiz.choices || []).forEach(function(choice, idx){
        var li = document.createElement('li');
        li.textContent = (idx + 1) + '. ' + choice;
        options.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderBlueprint(blueprint) {
    var panel = document.querySelector('[data-role="blueprint-panel"]');
    if (!panel) return;
    panel.innerHTML = '';
    var status = document.createElement('p');
    status.textContent = 'Status: ' + (blueprint.status || 'in discovery');
    panel.appendChild(status);
    if (blueprint.integrations) {
      var list = document.createElement('ul');
      blueprint.integrations.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      panel.appendChild(list);
    }
    if (blueprint.notes) {
      var notes = document.createElement('p');
      notes.textContent = 'Notes: ' + blueprint.notes;
      panel.appendChild(notes);
    }
  }

  function handleCoachForm() {
    var form = document.querySelector('[data-role="coach-form"]');
    if (!form) return;
    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var notes = $('#coachNotes', form).value;
      var biasChecks = Array.prototype.slice.call(form.querySelectorAll('input[name="biasChecks"]:checked')).map(function(input){
        return input.value;
      });
      fetchJSON('/api/ai-toolkit/coach/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlineNotes: notes, biasChecks: biasChecks })
      }).then(function(body){
        var resultContainer = document.querySelector('[data-role="coach-results"]');
        if (!resultContainer) return;
        resultContainer.hidden = false;
        $('[data-role="coach-score"]').textContent = 'Composite guardrail score: ' + body.coachSummary.score;
        var strengths = $('[data-role="coach-strengths"]');
        strengths.innerHTML = '';
        (body.coachSummary.strengths || []).forEach(function(item){
          var li = document.createElement('li');
          li.textContent = item;
          strengths.appendChild(li);
        });
        var adjustments = $('[data-role="coach-adjustments"]');
        adjustments.innerHTML = '';
        (body.coachSummary.adjustments || []).forEach(function(item){
          var li = document.createElement('li');
          li.textContent = item;
          adjustments.appendChild(li);
        });
        var prompts = $('[data-role="coach-prompts"]');
        prompts.innerHTML = '';
        (body.coachSummary.prompts || []).forEach(function(prompt){
          var p = document.createElement('p');
          p.textContent = prompt;
          prompts.appendChild(p);
        });
      }).catch(function(err){
        showToast('Unable to score notes. Please try again.', 'error');
        console.error(err);
      });
    });
  }

  function handleOnboardingForm() {
    var form = document.querySelector('[data-role="onboarding-form"]');
    if (!form) return;
    var output = document.querySelector('[data-role="onboarding-results"]');
    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var goal = $('#onboardingGoal', form).value;
      fetchJSON('/api/ai-toolkit/onboarding/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal })
      }).then(function(body){
        if (!output) return;
        output.hidden = false;
        output.textContent = body.message + ' Recommended modules: ' + (body.recommended || []).join(', ');
        showToast('Personalized plan updated.', 'success');
      }).catch(function(err){
        showToast('Unable to build plan right now.', 'error');
        console.error(err);
      });
    });
  }

  ready(function(){
    fetchJSON('/api/ai-toolkit/learning/tracks').then(function(body){ renderTracks(body.tracks || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/labs/scenarios').then(function(body){ renderLabs(body.labs || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/community/cases').then(function(body){ renderCases(body.cases || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/fundamentals/snapshots').then(function(body){ renderSnapshots(body.snapshots || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/simulator/branches').then(function(body){ renderBranches(body.branches || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/mindful/dashboard').then(function(body){ renderMindful(body.dashboard || {}); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/briefings/ai-literacy').then(function(body){ renderBriefings(body.briefings || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/earnings/notebook').then(function(body){ renderNotebook(body.notebook || {}); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/tools/unlocks').then(function(body){ renderTiers(body.tiers || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/audit/logs').then(function(body){ renderAudit(body.logs || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/mentor/personas').then(function(body){ renderMentors(body.mentors || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/myths').then(function(body){ renderMyths(body.myths || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/brokerage/blueprint').then(function(body){ renderBlueprint(body.blueprint || {}); }).catch(function(err){ console.error(err); });

    handleCoachForm();
    handleOnboardingForm();
  });
})();
