-- OnTalk — demo curriculum seed
-- Safe to run repeatedly: lessons/quizzes upsert on a fixed id, and their
-- child rows are replaced wholesale.
--
-- JSON payloads use dollar-quoting ($j$...$j$) because the English content is
-- full of apostrophes ("I'd like", "Could we...").

-- ===========================================================================
-- LESSONS
-- ===========================================================================
insert into public.lessons
  (id, slug, title, description, level, topic, estimated_minutes, xp_reward, order_index, is_premium)
values
  ('11111111-0000-4000-8000-000000000001', 'introductions', 'Introductions',
   'Say hello, give your name, and start a friendly conversation.',
   'A1', 'everyday', 8, 20, 1, false),

  ('11111111-0000-4000-8000-000000000002', 'daily-routine', 'Daily Routine',
   'Talk about what you do every day using the present simple.',
   'A1', 'everyday', 9, 20, 2, false),

  ('11111111-0000-4000-8000-000000000003', 'family-and-friends', 'Family and Friends',
   'Describe the people closest to you and how you spend time together.',
   'A1', 'people', 8, 20, 3, false),

  ('11111111-0000-4000-8000-000000000004', 'food-and-drinks', 'Food and Drinks',
   'Name everyday food and say what you like and dislike.',
   'A1', 'food', 9, 20, 4, false),

  ('11111111-0000-4000-8000-000000000005', 'ordering-at-a-restaurant', 'Ordering Food at a Restaurant',
   'Order politely, ask for recommendations, and pay the bill.',
   'A2', 'food', 10, 25, 5, false),

  ('11111111-0000-4000-8000-000000000006', 'talking-about-the-past', 'Talking About the Past',
   'Use the past simple to tell someone what you did.',
   'A2', 'grammar', 11, 25, 6, false),

  ('11111111-0000-4000-8000-000000000007', 'travel-and-directions', 'Travel and Directions',
   'Ask for directions, buy tickets, and find your way around.',
   'A2', 'travel', 10, 25, 7, false),

  ('11111111-0000-4000-8000-000000000008', 'shopping', 'Shopping',
   'Ask about sizes and prices, and return something that does not fit.',
   'A2', 'everyday', 9, 25, 8, false),

  ('11111111-0000-4000-8000-000000000009', 'giving-opinions', 'Giving Opinions',
   'Share what you think, agree, and disagree politely.',
   'B1', 'conversation', 12, 30, 9, false),

  ('11111111-0000-4000-8000-000000000010', 'job-interviews', 'Job Interviews',
   'Answer common interview questions and describe your experience.',
   'B1', 'work', 14, 30, 10, false),

  ('11111111-0000-4000-8000-000000000011', 'technology-in-everyday-life', 'Technology in Everyday Life',
   'Discuss the apps and devices you use, and the problems they cause.',
   'B1', 'technology', 12, 30, 11, true),

  ('11111111-0000-4000-8000-000000000012', 'making-plans', 'Making Plans',
   'Suggest, accept, and politely decline invitations.',
   'B1', 'conversation', 11, 30, 12, true)
on conflict (id) do update set
  slug              = excluded.slug,
  title             = excluded.title,
  description       = excluded.description,
  level             = excluded.level,
  topic             = excluded.topic,
  estimated_minutes = excluded.estimated_minutes,
  xp_reward         = excluded.xp_reward,
  order_index       = excluded.order_index,
  is_premium        = excluded.is_premium,
  is_published      = true;

-- Replace all sections for the seeded lessons.
delete from public.lesson_sections
where lesson_id in (
  select id from public.lessons
  where id::text like '11111111-0000-4000-8000-%'
);

-- ---------------------------------------------------------------------------
-- LESSON 1 — Introductions (full content)
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000001', 'introduction', 'Meeting someone new',
 $j${"heading":"Meeting someone new","body":"The first thirty seconds of a conversation follow a pattern. Learn the pattern once and you can introduce yourself to anyone in English.","objectives":["Greet someone at any time of day","Give your name and where you are from","Reply naturally when someone introduces themselves"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000001', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"introduce","definition":"to tell someone your name or who you are","example":"Let me introduce myself.","phonetic":"/ˌɪntrəˈdjuːs/"},
   {"word":"greeting","definition":"words you say when you meet someone","example":"Good morning is a common greeting."},
   {"word":"neighbour","definition":"a person who lives near you","example":"My neighbour is very friendly."}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000001', 'grammar', 'The verb "be"',
 $j${"rule":"I am / you are / he is","explanation":"English uses the verb be to say who you are and where you are from. In speech it is almost always shortened: I am becomes I'm.","examples":["I'm Ana.","I'm from Brazil.","She's my neighbour.","They're students."]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000001', 'example', 'Greetings by time of day',
 $j${"heading":"Pick the greeting that matches the clock","items":[
   {"text":"Good morning.","note":"Before 12:00"},
   {"text":"Good afternoon.","note":"12:00 until about 18:00"},
   {"text":"Good evening.","note":"After about 18:00"},
   {"text":"Hi / Hello.","note":"Any time, informal and always safe"}
 ]}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000001', 'multiple_choice', 'Choose the natural reply',
 $j${"question":"Someone says: \"Nice to meet you.\" What is the most natural reply?","options":["Nice to meet you too.","Yes, I am nice.","Thank you for meeting.","I meet you nice."],"correctIndex":0,"explanation":"English speakers mirror the phrase and add too. Nice to meet you too is the standard reply."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000001', 'fill_blank', 'Complete the introduction',
 $j${"sentence":"Hello, my name ___ Ana.","options":["is","are","am","be"],"answer":"is","explanation":"Name is a singular third-person subject, so it takes is."}$j$::jsonb, 6),

('11111111-0000-4000-8000-000000000001', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"Hello, my name is Ana. Nice to meet you.","tip":"Pause slightly after your name. It gives the other person a moment to catch it."}$j$::jsonb, 7),

('11111111-0000-4000-8000-000000000001', 'summary', 'What you learned',
 $j${"points":["Greetings change with the time of day, but Hello always works.","Use I'm + name and I'm from + country.","Reply to Nice to meet you with Nice to meet you too."],"nextStep":"Try the quiz, then practise the phrase in the Speaking tab."}$j$::jsonb, 8);

-- ---------------------------------------------------------------------------
-- LESSON 2 — Daily Routine
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000002', 'introduction', 'Your day in English',
 $j${"heading":"Your day in English","body":"Describing your routine is the fastest way to practise the present simple, because you already know the content by heart.","objectives":["Describe your morning, afternoon and evening","Use usually, always and never correctly"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000002', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"routine","definition":"the usual order in which you do things","example":"My morning routine starts at seven."},
   {"word":"usually","definition":"most of the time","example":"I usually walk to work."},
   {"word":"weekend","definition":"Saturday and Sunday","example":"What do you do at the weekend?"}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000002', 'grammar', 'Present simple + frequency',
 $j${"rule":"Frequency words go before the main verb","explanation":"Always, usually, often, sometimes and never sit between the subject and the verb — but after the verb be.","examples":["I always check my phone first.","She never drinks coffee after six.","He is usually late."]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000002', 'multiple_choice', 'Word order',
 $j${"question":"Which sentence is correct?","options":["I usually get up at seven.","I get usually up at seven.","Usually I get up always at seven.","I get up usually at seven o'clock always."],"correctIndex":0,"explanation":"Usually goes between the subject (I) and the main verb (get up)."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000002', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"I usually get up at seven and have breakfast at half past seven.","tip":"Link the words get up so they sound like one word: ge-tup."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000002', 'summary', 'What you learned',
 $j${"points":["Use the present simple for habits and routines.","Frequency words go before the main verb, after be."],"nextStep":"Describe your own day out loud using three frequency words."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 3 — Family and Friends
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000003', 'introduction', 'The people around you',
 $j${"heading":"The people around you","body":"Family questions come up in almost every first conversation. A few possessive forms will take you a long way.","objectives":["Name family members","Use my, his, her and their","Describe someone in one or two sentences"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000003', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"relative","definition":"a member of your family","example":"My relatives live in Madrid."},
   {"word":"friend","definition":"someone you like and know well","example":"She has been my friend since school."},
   {"word":"borrow","definition":"to take something and give it back later","example":"Can I borrow your pen?"}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000003', 'grammar', 'Possessive adjectives',
 $j${"rule":"my, your, his, her, our, their","explanation":"The possessive matches the owner, not the thing owned. His sister and her brother both stay the same whether there is one or many.","examples":["This is my sister.","Her brother works in Lisbon.","Their children are at school."]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000003', 'fill_blank', 'Complete the sentence',
 $j${"sentence":"Marco lives with ___ parents in Rome.","options":["his","her","their","its"],"answer":"his","explanation":"Marco is the owner and he is male, so the possessive is his."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000003', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"I have one sister and two brothers. My sister lives abroad.","tip":"The plural brothers ends in a /z/ sound, not /s/."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000003', 'summary', 'What you learned',
 $j${"points":["Possessive adjectives agree with the owner.","Use have got or have to describe your family."],"nextStep":"Introduce three people in your family to your AI tutor."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 4 — Food and Drinks
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000004', 'introduction', 'Talking about food',
 $j${"heading":"Talking about food","body":"Food vocabulary is useful immediately — in shops, at work, and at any dinner table.","objectives":["Name everyday meals and drinks","Say what you like and dislike","Use countable and uncountable nouns"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000004', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"breakfast","definition":"the first meal of the day","example":"I have breakfast at eight."},
   {"word":"hungry","definition":"needing food","example":"I'm hungry. Let's eat."},
   {"word":"thirsty","definition":"needing something to drink","example":"I'm thirsty; can I have some water?"},
   {"word":"delicious","definition":"tasting very good","example":"This soup is delicious."}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000004', 'grammar', 'some and any',
 $j${"rule":"some in positives, any in questions and negatives","explanation":"Both work with uncountable nouns and plurals. The exception: use some in a question when you are offering something.","examples":["I'd like some water.","Do you have any milk?","There isn't any bread left.","Would you like some tea?"]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000004', 'multiple_choice', 'some or any?',
 $j${"question":"Complete: \"We don't have ___ coffee.\"","options":["any","some","a","many"],"correctIndex":0,"explanation":"Negative sentences take any. Coffee here is uncountable, so a is impossible."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000004', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"I'd like some water, please. I'm really thirsty.","tip":"I'd is one short sound — it should not sound like I would."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000004', 'summary', 'What you learned',
 $j${"points":["Use some in positive sentences and offers.","Use any in questions and negatives."],"nextStep":"You are ready for the restaurant lesson at A2."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 5 — Ordering Food at a Restaurant (full showcase lesson)
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000005', 'introduction', 'Ordering with confidence',
 $j${"heading":"Ordering with confidence","body":"Restaurants follow a script. Once you know the four moments — sitting down, ordering, asking for advice, and paying — you can handle the whole meal in English.","objectives":["Ask for the menu politely","Order using I'd like","Ask the waiter for a recommendation","Ask for the bill at the end"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000005', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"menu","definition":"a list of the food a restaurant serves","example":"Could I see the menu, please?","phonetic":"/ˈmenjuː/"},
   {"word":"starter","definition":"a small dish eaten before the main course","example":"I'd like the soup as a starter."},
   {"word":"main course","definition":"the largest dish of a meal","example":"For my main course I'll have the chicken."},
   {"word":"dessert","definition":"sweet food eaten at the end of a meal","example":"Would you like a dessert?","phonetic":"/dɪˈzɜːt/"},
   {"word":"bill","definition":"the paper showing how much you must pay","example":"Could we have the bill, please?"},
   {"word":"recommend","definition":"to suggest something because you think it is good","example":"What do you recommend?","phonetic":"/ˌrekəˈmend/"}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000005', 'example', 'Useful expressions',
 $j${"heading":"Four phrases that cover most of a meal","items":[
   {"text":"Could I see the menu, please?","note":"When you sit down"},
   {"text":"I'd like the chicken, please.","note":"To order"},
   {"text":"What do you recommend?","note":"When you cannot decide"},
   {"text":"Could we have the bill, please?","note":"To pay"}
 ]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000005', 'grammar', 'I''d like + noun',
 $j${"rule":"I'd like + noun","explanation":"I'd like is the polite form of I want. I want sounds blunt to English speakers; I'd like is what you will hear in every restaurant. It is followed directly by a noun.","examples":["I'd like a coffee.","I'd like the chicken.","I'd like some water.","I'd like the soup, please."]}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000005', 'reading', 'At the restaurant',
 $j${"title":"A short conversation","paragraphs":[
   "Waiter: Good evening. Are you ready to order?",
   "Ana: Not quite. Could I see the menu again, please?",
   "Waiter: Of course. Here you are.",
   "Ana: Thank you. What do you recommend?",
   "Waiter: The fish is very good today.",
   "Ana: That sounds nice. I'd like the fish, please. And some water.",
   "Waiter: Certainly. Anything for dessert?",
   "Ana: Not for me, thanks. Could we have the bill, please?"
 ],"questions":["What did Ana order?","Which phrase did she use to ask for advice?"]}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000005', 'multiple_choice', 'Choose the correct sentence',
 $j${"question":"You want to order the chicken politely. Which sentence is correct?","options":["I'd like the chicken, please.","I like to the chicken, please.","I'd like to the chicken, please.","I am liking the chicken, please."],"correctIndex":0,"explanation":"I'd like is followed directly by a noun — no to. I like means a general preference, not an order."}$j$::jsonb, 6),

('11111111-0000-4000-8000-000000000005', 'fill_blank', 'Fill in the blank',
 $j${"sentence":"Could we have the ___, please? We need to pay and leave.","options":["bill","menu","starter","dessert"],"answer":"bill","explanation":"The bill is the paper showing what you owe. In American English you may also hear check."}$j$::jsonb, 7),

('11111111-0000-4000-8000-000000000005', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"Could I see the menu, please?","tip":"Let your voice fall at the end. A rising tone can sound uncertain rather than polite."}$j$::jsonb, 8),

('11111111-0000-4000-8000-000000000005', 'summary', 'What you learned',
 $j${"points":["Could I / Could we + verb is the polite way to ask in a restaurant.","I'd like + noun is how you order — never I want.","What do you recommend? gets you a suggestion from the waiter."],"nextStep":"Take the 5-question quiz, then practise all four phrases aloud."}$j$::jsonb, 9);

-- ---------------------------------------------------------------------------
-- LESSON 6 — Talking About the Past
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000006', 'introduction', 'Telling someone what happened',
 $j${"heading":"Telling someone what happened","body":"The past simple is one tense with two shapes: regular verbs add -ed, and a short list of common verbs change completely.","objectives":["Form regular and irregular past verbs","Ask past questions with did"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000006', 'grammar', 'Past simple',
 $j${"rule":"regular: verb + -ed / irregular: learn by heart","explanation":"In questions and negatives the past moves onto did, and the main verb goes back to its base form. This trips up almost every learner at first.","examples":["I worked late yesterday.","She went to Paris last year.","Did you see the email?","I didn't go, not I didn't went."]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000006', 'example', 'Common irregular verbs',
 $j${"heading":"The ten you will use most","items":[
   {"text":"go → went"},{"text":"have → had"},{"text":"see → saw"},{"text":"make → made"},
   {"text":"take → took"},{"text":"come → came"},{"text":"get → got"},{"text":"say → said"},
   {"text":"think → thought"},{"text":"buy → bought"}
 ]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000006', 'multiple_choice', 'Past questions',
 $j${"question":"Which sentence is correct?","options":["Did you go to the meeting?","Did you went to the meeting?","Do you went to the meeting?","You did went to the meeting?"],"correctIndex":0,"explanation":"After did, the main verb returns to its base form: go, not went."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000006', 'fill_blank', 'Complete the sentence',
 $j${"sentence":"I ___ to the cinema last night.","options":["went","goed","gone","did go to"],"answer":"went","explanation":"Go is irregular. Its past simple form is went."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000006', 'summary', 'What you learned',
 $j${"points":["Regular verbs take -ed; common verbs are irregular.","After did, use the base form of the verb."],"nextStep":"Tell your AI tutor three things you did yesterday."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 7 — Travel and Directions
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000007', 'introduction', 'Finding your way',
 $j${"heading":"Finding your way","body":"You rarely need to understand every word of directions — you need the four or five that tell you where to turn.","objectives":["Ask for directions politely","Understand common direction words","Buy a ticket"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000007', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"directions","definition":"instructions for how to get somewhere","example":"Can you give me directions to the station?"},
   {"word":"platform","definition":"the place in a station where you get on a train","example":"The train leaves from platform four."},
   {"word":"luggage","definition":"the bags you take when travelling","example":"My luggage is very heavy."}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000007', 'example', 'Direction phrases',
 $j${"heading":"Listen for these","items":[
   {"text":"Go straight on."},{"text":"Turn left at the lights."},
   {"text":"It's on your right."},{"text":"It's opposite the bank."},
   {"text":"It's about five minutes on foot."}
 ]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000007', 'multiple_choice', 'Asking politely',
 $j${"question":"Which is the most polite way to stop a stranger?","options":["Excuse me, could you tell me how to get to the station?","Hey, station where?","Tell me the station.","I want station now."],"correctIndex":0,"explanation":"Excuse me opens the request and Could you makes it polite. Both matter when speaking to strangers."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000007', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"Excuse me, could you tell me how to get to the station?","tip":"Stress the word station — it carries the meaning of the question."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000007', 'summary', 'What you learned',
 $j${"points":["Open with Excuse me, then ask with Could you.","Listen for left, right, straight on and opposite."],"nextStep":"Practise asking for three different places."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 8 — Shopping
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000008', 'introduction', 'In the shop',
 $j${"heading":"In the shop","body":"Buying is easy; returning something is where most learners get stuck. This lesson covers both.","objectives":["Ask about price, size and colour","Return an item and ask for a refund"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000008', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"receipt","definition":"a paper proving you paid","example":"Keep the receipt.","phonetic":"/rɪˈsiːt/"},
   {"word":"refund","definition":"money given back to you","example":"I'd like a refund for this shirt."},
   {"word":"discount","definition":"a reduction in price","example":"There's a 20% discount today."}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000008', 'example', 'Shop phrases',
 $j${"heading":"Buying and returning","items":[
   {"text":"How much is this?"},{"text":"Do you have this in a medium?"},
   {"text":"Can I try it on?"},{"text":"I'd like to return this, please."},
   {"text":"Here's the receipt."}
 ]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000008', 'fill_blank', 'Complete the sentence',
 $j${"sentence":"I'd like a ___, please. The shirt doesn't fit.","options":["refund","receipt","discount","platform"],"answer":"refund","explanation":"A refund is your money back. A receipt is the proof of purchase you show to get it."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000008', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"Excuse me, do you have this in a medium?","tip":"The letter p in medium is silent in speech — say mee-dee-um."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000008', 'summary', 'What you learned',
 $j${"points":["How much is / are ...? asks the price.","To return something: I'd like to return this + the reason."],"nextStep":"Role-play a return with your AI tutor."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 9 — Giving Opinions
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000009', 'introduction', 'Saying what you think',
 $j${"heading":"Saying what you think","body":"At B1, disagreeing well matters more than disagreeing at all. English softens disagreement heavily.","objectives":["Introduce an opinion","Agree and disagree politely","Ask for someone else's view"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000009', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"opinion","definition":"what you think about something","example":"In my opinion, the film was too long."},
   {"word":"disagree","definition":"to have a different opinion","example":"I'm afraid I disagree with that."}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000009', 'example', 'Opinion phrases',
 $j${"heading":"From strong to soft","items":[
   {"text":"I think / In my opinion...","note":"Neutral, always safe"},
   {"text":"I'd say that...","note":"Softer"},
   {"text":"I see what you mean, but...","note":"Disagreeing politely"},
   {"text":"I'm afraid I don't agree.","note":"Clear but still polite"},
   {"text":"What do you think?","note":"Hands the turn back"}
 ]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000009', 'multiple_choice', 'Polite disagreement',
 $j${"question":"Your colleague suggests an idea you dislike. Which reply is most appropriate at work?","options":["I see what you mean, but I'm not sure it would work here.","No. That's wrong.","You are completely wrong about this.","No, no, no."],"correctIndex":0,"explanation":"English speakers acknowledge the other view before disagreeing. The other options sound aggressive in a workplace."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000009', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"I see what you mean, but I'm not sure it would work here.","tip":"Slight pause after but — it signals that your real point is coming."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000009', 'summary', 'What you learned',
 $j${"points":["Open opinions with I think or In my opinion.","Acknowledge before you disagree.","Return the turn with What do you think?"],"nextStep":"Debate a topic with your AI tutor in Conversation mode."}$j$::jsonb, 6);

-- ---------------------------------------------------------------------------
-- LESSON 10 — Job Interviews (full content)
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000010', 'introduction', 'The interview script',
 $j${"heading":"The interview script","body":"Most interviews open with the same three questions. Preparing those three answers removes most of the pressure, and leaves you free to listen properly to the rest.","objectives":["Answer Tell me about yourself in under a minute","Describe experience with the present perfect","Ask the interviewer a good question at the end"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000010', 'vocabulary', 'Useful words',
 $j${"items":[
   {"word":"colleague","definition":"a person you work with","example":"My colleagues are very supportive.","phonetic":"/ˈkɒliːɡ/"},
   {"word":"deadline","definition":"the time by which something must be finished","example":"The deadline is Friday."},
   {"word":"reliable","definition":"able to be trusted to do what you promise","example":"She is a reliable employee."}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000010', 'grammar', 'Present perfect for experience',
 $j${"rule":"have/has + past participle","explanation":"Use the present perfect for experience with no specific time: I have worked. The moment you name the time, switch to the past simple: I worked there in 2021. Naming a time with the present perfect is the single most common B1 interview mistake.","examples":["I've worked in customer service for three years.","I've managed a small team.","I worked at Delta in 2021.","I haven't used that software before, but I learn quickly."]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000010', 'reading', 'A short interview',
 $j${"title":"Opening two minutes","paragraphs":[
   "Interviewer: Thanks for coming in. Tell me a little about yourself.",
   "Sam: Of course. I'm a customer support specialist. I've worked in support for about four years, mostly for software companies, and I've spent the last two years handling difficult escalations.",
   "Interviewer: What would you say your main strength is?",
   "Sam: Staying calm under pressure. I've dealt with a lot of frustrated customers, and I've learned that listening first solves most of it.",
   "Interviewer: Do you have any questions for me?",
   "Sam: Yes — how does the team measure success in the first six months?"
 ],"questions":["Which tense does Sam use to describe his experience?","Why is his closing question a good one?"]}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000010', 'example', 'Strong closing questions',
 $j${"heading":"Always have two ready","items":[
   {"text":"How does the team measure success in the first six months?"},
   {"text":"What does a typical week look like in this role?"},
   {"text":"What are the biggest challenges the team is facing right now?"}
 ]}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000010', 'multiple_choice', 'Choose the correct tense',
 $j${"question":"Which sentence is correct?","options":["I've worked in marketing for five years.","I've worked in marketing in 2019.","I work in marketing since five years.","I am working in marketing for five years ago."],"correctIndex":0,"explanation":"Present perfect + for + a length of time is correct. Once you name a finished time like 2019, you must use the past simple: I worked."}$j$::jsonb, 6),

('11111111-0000-4000-8000-000000000010', 'fill_blank', 'Complete the answer',
 $j${"sentence":"I ___ managed a team of six people.","options":["have","has","am","did"],"answer":"have","explanation":"First person singular takes have + past participle for the present perfect."}$j$::jsonb, 7),

('11111111-0000-4000-8000-000000000010', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"I've worked in customer service for three years, mostly with software teams.","tip":"I've is a single quick sound. Saying I have in full makes the sentence sound rehearsed."}$j$::jsonb, 8),

('11111111-0000-4000-8000-000000000010', 'summary', 'What you learned',
 $j${"points":["Present perfect describes experience without a fixed time.","Name a time and you must switch to the past simple.","Prepare two questions to ask at the end."],"nextStep":"Run a mock interview in the AI tutor's Interview Practice mode."}$j$::jsonb, 9);

-- ---------------------------------------------------------------------------
-- LESSON 11 — Technology in Everyday Life
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000011', 'introduction', 'Talking about technology',
 $j${"heading":"Talking about technology","body":"Technology is a default small-talk topic in English. It is also where a lot of useful verb-noun pairs live.","objectives":["Describe the tools you use daily","Explain a problem with a device"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000011', 'example', 'Natural collocations',
 $j${"heading":"Use the verb English actually uses","items":[
   {"text":"download an app","note":"not charge an app"},
   {"text":"charge your phone"},
   {"text":"back up your files"},
   {"text":"the battery is dead"},
   {"text":"my laptop keeps crashing"}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000011', 'multiple_choice', 'Choose the natural phrase',
 $j${"question":"Your phone has no power left. What do English speakers say?","options":["The battery is dead.","The battery is finished.","The battery is closed.","The battery has ended."],"correctIndex":0,"explanation":"Dead is the standard collocation for an empty battery, even though it sounds dramatic translated literally."}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000011', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"My laptop keeps crashing, so I back up my files every evening.","tip":"Keeps + -ing means it happens repeatedly and it annoys you."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000011', 'summary', 'What you learned',
 $j${"points":["Learn technology words as verb + noun pairs.","keeps + -ing describes an annoying repeated problem."],"nextStep":"Describe a device that frustrates you to your AI tutor."}$j$::jsonb, 5);

-- ---------------------------------------------------------------------------
-- LESSON 12 — Making Plans
-- ---------------------------------------------------------------------------
insert into public.lesson_sections (lesson_id, section_type, title, content, order_index) values
('11111111-0000-4000-8000-000000000012', 'introduction', 'Inviting and replying',
 $j${"heading":"Inviting and replying","body":"Saying no in English is rarely the word no. Learn the softening pattern and invitations become easy.","objectives":["Suggest an activity","Accept warmly","Decline without sounding rude"]}$j$::jsonb, 1),

('11111111-0000-4000-8000-000000000012', 'example', 'Invitation phrases',
 $j${"heading":"Suggest, accept, decline","items":[
   {"text":"Do you fancy getting a coffee?","note":"Informal, British"},
   {"text":"How about Friday evening?","note":"Suggesting a time"},
   {"text":"That sounds great.","note":"Accepting"},
   {"text":"I'd love to, but I'm busy on Friday.","note":"Declining — always give a reason"}
 ]}$j$::jsonb, 2),

('11111111-0000-4000-8000-000000000012', 'grammar', 'Present continuous for arrangements',
 $j${"rule":"be + verb-ing for fixed plans","explanation":"When a plan is already arranged with another person, English uses the present continuous, not will.","examples":["I'm meeting Sara at seven.","We're flying to Rome on Tuesday.","What are you doing this weekend?"]}$j$::jsonb, 3),

('11111111-0000-4000-8000-000000000012', 'fill_blank', 'Complete the sentence',
 $j${"sentence":"I'd love to, ___ I'm busy on Friday.","options":["but","and","so","because"],"answer":"but","explanation":"But introduces the contrast that softens the refusal — the standard polite-decline pattern."}$j$::jsonb, 4),

('11111111-0000-4000-8000-000000000012', 'speaking_prompt', 'Say it out loud',
 $j${"phrase":"I'd love to, but I'm busy on Friday. How about Saturday?","tip":"Offering an alternative keeps the invitation alive and sounds genuinely warm."}$j$::jsonb, 5),

('11111111-0000-4000-8000-000000000012', 'summary', 'What you learned',
 $j${"points":["Use the present continuous for arranged plans.","Decline with I'd love to, but... and offer an alternative."],"nextStep":"You have reached the end of the demo path — keep practising with your tutor."}$j$::jsonb, 6);

-- ===========================================================================
-- VOCABULARY (30 items)
-- ===========================================================================
insert into public.vocabulary (word, definition, example_sentence, part_of_speech, phonetic, level, topic) values
  ('introduce',   'to tell someone your name or who you are',        'Let me introduce myself.',                        'verb',      '/ˌɪntrəˈdjuːs/', 'A1', 'everyday'),
  ('greeting',    'words you say when you meet someone',             'Good morning is a common greeting.',              'noun',      null,             'A1', 'everyday'),
  ('routine',     'the usual order in which you do things',          'My morning routine starts at seven.',             'noun',      '/ruːˈtiːn/',     'A1', 'everyday'),
  ('breakfast',   'the first meal of the day',                       'I have breakfast at eight.',                      'noun',      null,             'A1', 'food'),
  ('relative',    'a member of your family',                         'My relatives live in Madrid.',                    'noun',      null,             'A1', 'people'),
  ('thirsty',     'needing something to drink',                      'I am thirsty; can I have some water?',            'adjective', null,             'A1', 'food'),
  ('delicious',   'tasting very good',                               'This soup is delicious.',                         'adjective', '/dɪˈlɪʃəs/',     'A1', 'food'),
  ('usually',     'most of the time',                                'I usually walk to work.',                         'adverb',    null,             'A1', 'everyday'),
  ('weekend',     'Saturday and Sunday',                             'What do you do at the weekend?',                  'noun',      null,             'A1', 'everyday'),
  ('hungry',      'needing food',                                    'I am hungry. Let us eat.',                        'adjective', null,             'A1', 'food'),
  ('neighbour',   'a person who lives near you',                      'My neighbour is very friendly.',                  'noun',      '/ˈneɪbə/',       'A1', 'people'),
  ('borrow',      'to take something and give it back later',        'Can I borrow your pen?',                          'verb',      null,             'A1', 'everyday'),

  ('menu',        'a list of the food a restaurant serves',          'Could I see the menu, please?',                   'noun',      '/ˈmenjuː/',      'A2', 'food'),
  ('starter',     'a small dish eaten before the main course',       'I would like the soup as a starter.',             'noun',      null,             'A2', 'food'),
  ('main course', 'the largest dish of a meal',                      'For my main course I will have the chicken.',     'noun',      null,             'A2', 'food'),
  ('dessert',     'sweet food eaten at the end of a meal',           'Would you like a dessert?',                       'noun',      '/dɪˈzɜːt/',      'A2', 'food'),
  ('bill',        'the paper showing how much you must pay',         'Could we have the bill, please?',                 'noun',      null,             'A2', 'food'),
  ('recommend',   'to suggest something because you think it is good','What do you recommend?',                         'verb',      '/ˌrekəˈmend/',   'A2', 'food'),
  ('book',        'to arrange to have something at a later time',    'I would like to book a table for two.',           'verb',      null,             'A2', 'travel'),
  ('directions',  'instructions for how to get somewhere',           'Can you give me directions to the station?',      'noun',      null,             'A2', 'travel'),
  ('platform',    'the place in a station where you get on a train', 'The train leaves from platform four.',            'noun',      null,             'A2', 'travel'),
  ('refund',      'money given back to you',                         'I would like a refund for this shirt.',           'noun',      '/ˈriːfʌnd/',     'A2', 'everyday'),
  ('receipt',     'a paper proving you paid',                        'Keep the receipt.',                               'noun',      '/rɪˈsiːt/',      'A2', 'everyday'),
  ('discount',    'a reduction in price',                            'There is a 20% discount today.',                  'noun',      '/ˈdɪskaʊnt/',    'A2', 'everyday'),
  ('luggage',     'the bags you take when travelling',               'My luggage is very heavy.',                       'noun',      '/ˈlʌɡɪdʒ/',      'A2', 'travel'),

  ('opinion',     'what you think about something',                  'In my opinion, the film was too long.',           'noun',      '/əˈpɪnjən/',     'B1', 'conversation'),
  ('disagree',    'to have a different opinion',                     'I am afraid I disagree with that.',               'verb',      null,             'B1', 'conversation'),
  ('deadline',    'the time by which something must be finished',    'The deadline is Friday.',                         'noun',      null,             'B1', 'work'),
  ('colleague',   'a person you work with',                          'My colleagues are very supportive.',              'noun',      '/ˈkɒliːɡ/',      'B1', 'work'),
  ('reliable',    'able to be trusted to do what you promise',       'She is a reliable employee.',                     'adjective', '/rɪˈlaɪəbl/',    'B1', 'work')
on conflict (word) do update set
  definition       = excluded.definition,
  example_sentence = excluded.example_sentence,
  part_of_speech   = excluded.part_of_speech,
  phonetic         = excluded.phonetic,
  level            = excluded.level,
  topic            = excluded.topic;

-- ===========================================================================
-- QUIZZES
-- ===========================================================================
insert into public.quizzes (id, lesson_id, slug, title, passing_score, xp_reward) values
  ('22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000005',
   'restaurant-basics', 'Ordering Food at a Restaurant', 60, 15),
  ('22222222-0000-4000-8000-000000000002', '11111111-0000-4000-8000-000000000001',
   'introductions-basics', 'Introductions', 60, 15),
  ('22222222-0000-4000-8000-000000000003', '11111111-0000-4000-8000-000000000010',
   'interview-english', 'Job Interview English', 60, 20)
on conflict (id) do update set
  lesson_id     = excluded.lesson_id,
  slug          = excluded.slug,
  title         = excluded.title,
  passing_score = excluded.passing_score,
  xp_reward     = excluded.xp_reward;

delete from public.quiz_questions
where quiz_id in (
  select id from public.quizzes
  where id::text like '22222222-0000-4000-8000-%'
);

-- Quiz 1 — Restaurant
insert into public.quiz_questions (quiz_id, question_type, question_text, answer_data, correct_answer, explanation, order_index) values
('22222222-0000-4000-8000-000000000001', 'multiple_choice',
 'You want to order the chicken politely. Which sentence is correct?',
 $j${"options":["I'd like the chicken, please.","I want chicken.","I'd like to the chicken, please.","I am liking the chicken."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$I'd like is followed directly by a noun. I want is grammatically fine but sounds blunt in a restaurant.$j$, 1),

('22222222-0000-4000-8000-000000000001', 'multiple_choice',
 'Which phrase asks the waiter for a suggestion?',
 $j${"options":["What do you recommend?","What do you want?","What is this menu?","Where is my food?"]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$Recommend means to suggest something good. This is the standard phrase when you cannot decide.$j$, 2),

('22222222-0000-4000-8000-000000000001', 'fill_blank',
 'Could we have the ___, please? We are ready to pay.',
 $j${"options":["bill","menu","starter","dessert"]}$j$::jsonb,
 $j${"text":"bill"}$j$::jsonb,
 $j$The bill shows what you owe. American English often says check instead.$j$, 3),

('22222222-0000-4000-8000-000000000001', 'true_false',
 'A starter is eaten after the main course.',
 $j${"options":["True","False"]}$j$::jsonb,
 $j${"value":false}$j$::jsonb,
 $j$A starter comes before the main course. Dessert is the dish that comes last.$j$, 4),

('22222222-0000-4000-8000-000000000001', 'multiple_choice',
 'Which is the most polite way to ask for the menu?',
 $j${"options":["Could I see the menu, please?","Give me the menu.","Menu.","I need menu now."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$Could I + verb + please is the standard polite request pattern in English.$j$, 5);

-- Quiz 2 — Introductions
insert into public.quiz_questions (quiz_id, question_type, question_text, answer_data, correct_answer, explanation, order_index) values
('22222222-0000-4000-8000-000000000002', 'multiple_choice',
 'Someone says "Nice to meet you." What is the most natural reply?',
 $j${"options":["Nice to meet you too.","Yes, I am nice.","Thank you for meeting.","I meet you nice."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$English speakers mirror the phrase and add too.$j$, 1),

('22222222-0000-4000-8000-000000000002', 'fill_blank',
 'Hello, my name ___ Ana.',
 $j${"options":["is","are","am","be"]}$j$::jsonb,
 $j${"text":"is"}$j$::jsonb,
 $j$Name is a singular third-person subject, so it takes is.$j$, 2),

('22222222-0000-4000-8000-000000000002', 'multiple_choice',
 'It is 9 in the morning. Which greeting fits best?',
 $j${"options":["Good morning.","Good evening.","Good night.","Good afternoon."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$Good morning is used before midday. Good night is a farewell, not a greeting.$j$, 3),

('22222222-0000-4000-8000-000000000002', 'true_false',
 '"Good night" is a normal way to greet someone when you arrive at a party.',
 $j${"options":["True","False"]}$j$::jsonb,
 $j${"value":false}$j$::jsonb,
 $j$Good night is only used when leaving or going to bed. Use Good evening to greet.$j$, 4),

('22222222-0000-4000-8000-000000000002', 'multiple_choice',
 'Which sentence correctly says where you are from?',
 $j${"options":["I'm from Brazil.","I'm of Brazil.","I from Brazil.","I am come from Brazil."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$The pattern is be + from + country.$j$, 5);

-- Quiz 3 — Job interviews
insert into public.quiz_questions (quiz_id, question_type, question_text, answer_data, correct_answer, explanation, order_index) values
('22222222-0000-4000-8000-000000000003', 'multiple_choice',
 'Which sentence describes experience correctly?',
 $j${"options":["I've worked in marketing for five years.","I've worked in marketing in 2019.","I work in marketing since five years.","I am working in marketing for five years ago."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$Present perfect + for + a period of time. Naming a finished year forces the past simple instead.$j$, 1),

('22222222-0000-4000-8000-000000000003', 'fill_blank',
 'I ___ managed a team of six people.',
 $j${"options":["have","has","am","did"]}$j$::jsonb,
 $j${"text":"have"}$j$::jsonb,
 $j$First person singular takes have + past participle.$j$, 2),

('22222222-0000-4000-8000-000000000003', 'true_false',
 'It is a good idea to ask the interviewer a question at the end.',
 $j${"options":["True","False"]}$j$::jsonb,
 $j${"value":true}$j$::jsonb,
 $j$Asking a thoughtful question shows genuine interest and is expected in most English-speaking workplaces.$j$, 3),

('22222222-0000-4000-8000-000000000003', 'multiple_choice',
 'You have never used a piece of software. What is the best answer?',
 $j${"options":["I haven't used it before, but I learn new tools quickly.","No.","I don't know it. Sorry.","That is not my job."]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$Acknowledge the gap, then show how you close it. A bare no ends the conversation.$j$, 4),

('22222222-0000-4000-8000-000000000003', 'multiple_choice',
 'Which word means a person you work with?',
 $j${"options":["colleague","deadline","refund","platform"]}$j$::jsonb,
 $j${"index":0}$j$::jsonb,
 $j$A colleague is a co-worker. A deadline is when work is due.$j$, 5);
