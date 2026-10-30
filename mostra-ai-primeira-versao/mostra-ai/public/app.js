const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const marketing = $('#marketing'), app = $('#app');
function showApp(page='overview') { marketing.classList.add('hidden'); app.classList.remove('hidden'); navigate(page); window.scrollTo(0,0); }
function showMarketing(){app.classList.add('hidden');marketing.classList.remove('hidden');window.scrollTo(0,0)}
['go-dashboard','hero-start','feature-start','bottom-start'].forEach(id=>$('#'+id)?.addEventListener('click',()=>openAuth('signup'))); $('#go-login').addEventListener('click',()=>openAuth('login'));
$('#mobile-menu').addEventListener('click',()=>$('.navlinks').classList.toggle('mobile-open'));
const pageNames={overview:'Visão geral',site:'Meu site',products:'Produtos e estoque',orders:'Pedidos',customers:'Clientes',crm:'CRM e oportunidades',reports:'Relatórios',plans:'Meu plano',settings:'Configurações'};
function navigate(page){if(!pageNames[page])page='overview';$$('.page-panel').forEach(el=>el.classList.add('hidden'));$('#page-'+page)?.classList.remove('hidden');$$('.side-link').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('#crumb').textContent=pageNames[page];$('#page-title').textContent=page==='overview'?'Bom dia! 👋':pageNames[page];$('#page-subtitle').textContent=({overview:'Aqui está um resumo do que está acontecendo no seu negócio.',site:'Descreva sua empresa e prepare a estrutura do seu site.',products:'Organize seu catálogo e acompanhe a disponibilidade dos itens.',orders:'Acompanhe as solicitações recebidas pelo seu negócio.',customers:'Construa relacionamentos e mantenha seus contatos organizados.',crm:'Visualize suas oportunidades e acompanhe cada etapa.',reports:'Entenda os resultados com base nos dados da sua empresa.',plans:'Consulte os recursos disponíveis para sua empresa.',settings:'Gerencie as informações e preferências da sua conta.'})[page];$('#new-action-label').textContent=page==='products'?'Adicionar produto':page==='customers'?'Adicionar cliente':page==='site'?'Criar meu site':'Adicionar produto';$('#new-action').style.display=['products','customers','overview'].includes(page)?'':'none';$('#sidebar').classList.remove('open');}
$$('.side-link').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.page)));
$$('[data-goto]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.goto)));
$('#menu-toggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#new-action').addEventListener('click',()=>{const active=$('.side-link.active')?.dataset.page;if(active==='customers'){toast('Cadastro de clientes será ativado com o banco de dados.')}else openModal()});
$('#add-product').addEventListener('click',openModal);
$('#help-btn').addEventListener('click',()=>toast('A central de suporte será conectada nesta etapa.'));
const modal=$('#modal');function openModal(){modal.classList.remove('hidden')}function closeModal(){modal.classList.add('hidden')}$('#modal-close').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
function openModal(){if(!currentUser){openAuth('login');return}modal.classList.remove('hidden')}
function closeModal(){modal.classList.add('hidden')}
$('#add-customer').addEventListener('click',()=>toast('Cadastro de clientes será ativado na próxima fase.'));
$('#generate-site').addEventListener('click',()=>{const d=$('#business-description').value.trim();if(d.length<20){toast('Conte um pouco mais sobre seu negócio para continuar.');$('#business-description').focus();return}const style=$('#business-style').value;$('#site-result').classList.remove('hidden');$('#site-result').innerHTML='<b>Descrição preparada!</b><br>Estilo selecionado: '+escapeHtml(style)+'. A integração de IA ainda não está conectada. Sua descrição está pronta para a próxima etapa.';toast('Briefing preparado para o futuro gerador de IA.');});
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),2800)}

const SUPABASE_URL="https://edpbhcnhxhvnqhnajcaa.supabase.co";
const SUPABASE_KEY="sb_publishable_soCSbGnRuDaZ2-39IPhbMQ_2_kpT13k";
let supabase=null,currentUser=null,currentCompany=null,authMode="login";
function openAuth(mode="login"){authMode=mode;$('#auth-modal').classList.remove('hidden');renderAuthMode()}
function closeAuth(){$('#auth-modal').classList.add('hidden')}
function renderAuthMode(){const isSignup=authMode==="signup";$('#auth-title').textContent=isSignup?"Criar sua conta":"Entrar no Mostra Aí";$('#auth-description').textContent=isSignup?"Cadastre sua empresa para começar.":"Acesse os dados da sua empresa.";$('#signup-fields').classList.toggle('hidden',!isSignup);$('#signup-fields input').required=isSignup;$('#auth-submit').textContent=isSignup?"Criar conta":"Entrar"}
async function ensureCompany(user){
 const {data:member,error}=await supabase.from('mostra_ai_members').select('company_id,role,company:mostra_ai_companies(id,name,slug)').eq('user_id',user.id).limit(1).maybeSingle();
 if(error)throw error;if(member?.company){currentCompany=member.company;return currentCompany}
 const name=(user.user_metadata?.company_name||user.email?.split('@')[0]||"Minha empresa").trim();
 const slug=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+user.id.slice(0,6);
 const {data:company,error:companyError}=await supabase.from('mostra_ai_companies').insert({owner_user_id:user.id,name,slug}).select().single();if(companyError)throw companyError;
 const {error:memberError}=await supabase.from('mostra_ai_members').insert({company_id:company.id,user_id:user.id,role:'owner'});if(memberError)throw memberError;
 const {error:siteError}=await supabase.from('mostra_ai_sites').insert({company_id:company.id,title:name,slug,status:'draft',content:{}});if(siteError)console.warn(siteError.message);
 currentCompany=company;return company;
}
async function loadProducts(){
 if(!supabase||!currentCompany)return;
 const body=$('#product-rows');body.innerHTML='<tr><td colspan="6">Carregando...</td></tr>';
 const {data,error}=await supabase.from('mostra_ai_products').select('id,name,category,price_cents,stock_quantity,minimum_stock,is_active').eq('company_id',currentCompany.id).order('created_at',{ascending:false});
 if(error){body.innerHTML='<tr><td colspan="6">'+escapeHtml(error.message)+'</td></tr>';return}
 const term=($('#product-search')?.value||'').toLowerCase();
 const rows=(data||[]).filter(p=>(p.name||'').toLowerCase().includes(term)||(p.category||'').toLowerCase().includes(term));
 body.innerHTML=rows.map(p=>{const price=(p.price_cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2});const low=p.stock_quantity<=p.minimum_stock;const label=!p.is_active?'Inativo':p.stock_quantity===0?'Em falta':low?'Estoque baixo':'Disponível';const cls=!p.is_active||p.stock_quantity===0?'status-out':low?'status-pending':'status-done';return '<tr><td><b>'+escapeHtml(p.name)+'</b></td><td>'+escapeHtml(p.category||'Sem categoria')+'</td><td>R$ '+price+'</td><td>'+p.stock_quantity+' un.</td><td><span class="status '+cls+'">'+label+'</span></td><td></td></tr>'}).join('')||'<tr><td colspan="6">Você ainda não cadastrou produtos.</td></tr>';
 if($('#product-foot'))$('#product-foot').textContent=rows.length+' produto(s) da sua empresa.';
}
$('#product-form').addEventListener('submit',saveProduct);
async function saveProduct(e){
 e.preventDefault();if(!currentCompany){toast('Entre na sua conta primeiro.');return}
 const f=new FormData(e.currentTarget),price=Number(f.get('price')),stock=Number(f.get('stock'));
 if(!Number.isFinite(price)||price<0||!Number.isInteger(stock)||stock<0){toast('Confira o preço e a quantidade.');return}
 const button=e.currentTarget.querySelector('button[type=submit]');button.disabled=true;button.textContent='Salvando...';
 const {error}=await supabase.from('mostra_ai_products').insert({company_id:currentCompany.id,name:String(f.get('name')).trim(),price_cents:Math.round(price*100),stock_quantity:stock,category:String(f.get('category')||'').trim()||null});
 button.disabled=false;button.textContent='Salvar produto';if(error){toast('Erro ao salvar: '+error.message);return}
 e.currentTarget.reset();closeModal();await loadProducts();toast('Produto salvo no banco de dados!');
}
$('#auth-close').addEventListener('click',closeAuth);
$('#auth-modal').addEventListener('click',e=>{if(e.target===$('#auth-modal'))closeAuth()});
$('#auth-toggle').addEventListener('click',()=>{authMode=authMode==='login'?'signup':'login';renderAuthMode()});
$('#auth-form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget),email=String(f.get('email')).trim(),password=String(f.get('password')),company=String(f.get('company')||'').trim(),btn=$('#auth-submit');btn.disabled=true;btn.textContent='Aguarde...';try{
 if(authMode==='signup'){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{company_name:company}}});if(error)throw error;if(data.session&&data.user){await completeLogin(data.user)}else{$('#auth-message').textContent='Confirme seu e-mail. Depois entre para concluir a configuração da empresa.';toast('Confira seu e-mail para confirmar o cadastro.')}}
 else{const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await completeLogin(data.user)}
 }catch(err){toast(err.message||'Não foi possível autenticar.')}finally{btn.disabled=false;btn.textContent=authMode==='signup'?'Criar conta':'Entrar'}});
async function completeLogin(user){currentUser=user;await ensureCompany(user);$('.workspace b').textContent=currentCompany.name;$('.workspace small').textContent='Conta conectada';$('.profile b').textContent=user.email||'Usuário';$('.profile small').textContent='Administrador';$('.profile-avatar').textContent=currentCompany.name.slice(0,1).toUpperCase();$('.header-avatar').textContent=currentCompany.name.slice(0,1).toUpperCase();closeAuth();showApp('overview');await loadProducts()}
async function initSupabase(){try{const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.118.0');supabase=createClient(SUPABASE_URL,SUPABASE_KEY);const {data:{session},error}=await supabase.auth.getSession();if(error)throw error;if(session?.user)await completeLogin(session.user)}catch(err){console.error(err);toast('Falha ao conectar ao Supabase: '+(err.message||err))}}
initSupabase();
