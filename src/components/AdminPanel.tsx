import { useState, useEffect, useRef } from 'react';
import { supabase, type Product, type Testimonial, CATEGORIES } from '../lib/supabase';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, ArrowLeft, Image, LogOut, Upload, GripVertical, RefreshCw, Star, MessageSquare, BarChart3, Users, Megaphone, LayoutDashboard, FolderTree, WalletCards, Mail, Phone, Boxes, TrendingUp, Settings, Gamepad2, Package, ClipboardList } from 'lucide-react';
import { AdminStats } from './AdminStats';
import { AdminCustomers } from './AdminCustomers';
import { AdminBanner } from './AdminBanner';
import { AdminCategories } from './AdminCategories';
import { AdminFreeFireAccounts } from './AdminFreeFireAccounts';
import { AdminOrders } from './AdminOrders';
import { AdminPayments } from './AdminPayments';
import { AdminEmails, AdminNumbers } from './AdminContacts';
import { AdminInventory } from './AdminInventory';
import { AdminSales } from './AdminSales';
import { AdminSettings } from './AdminSettings';
import { AdminDashboard } from './AdminDashboard';

type AdminTab = 'dashboard' | 'catalogo' | 'categorias' | 'productos' | 'cuentas_ff' | 'pedidos' | 'clientes' | 'pagos' | 'correos' | 'numeros' | 'inventario' | 'ventas' | 'ganancias' | 'configuracion' | 'referencias' | 'estadisticas' | 'promocion';
const EXCHANGE_RATE = 3.45;
const ADMIN_NAV: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalogo', label: 'Catálogo', icon: FolderTree },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'categorias', label: 'Categorías', icon: FolderTree },
  { id: 'cuentas_ff', label: 'Cuentas Free Fire', icon: Gamepad2 },
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'pagos', label: 'Pagos', icon: WalletCards },
  { id: 'correos', label: 'Correos', icon: Mail },
  { id: 'numeros', label: 'Números', icon: Phone },
  { id: 'inventario', label: 'Inventario', icon: Boxes },
  { id: 'ventas', label: 'Ventas', icon: TrendingUp },
  { id: 'ganancias', label: 'Ganancias', icon: BarChart3 },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
  { id: 'referencias', label: 'Referencias', icon: MessageSquare },
  { id: 'promocion', label: 'Promoción', icon: Megaphone },
  { id: 'estadisticas', label: 'Estadísticas', icon: Eye },
];

interface ProductForm {
  name: string;
  description: string;
  price: string;
  price_usd: string;
  original_price: string;
  discount: string;
  image: string;
  gallery: string[];
  category: string;
  badge: string;
  details: string;
  warranty: string;
  status: 'disponible' | 'agotado';
  is_active: boolean;
  is_published: boolean;
  is_featured: boolean;
  featured_order: string;
  sort_order: string;
  service_name: string;
  duration: string;
  display_order: string;
  min_quantity: string;
  max_quantity: string;
  allow_manual_quantity: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  price_usd: '',
  original_price: '',
  discount: '0',
  image: '',
  gallery: [],
  category: 'diamantes',
  badge: '',
  details: '',
  warranty: '',
  status: 'disponible',
  is_active: true,
  is_published: false,
  is_featured: false,
  featured_order: '0',
  sort_order: '0',
  service_name: '',
  duration: '',
  display_order: '0',
  min_quantity: '1',
  max_quantity: '',
  allow_manual_quantity: false,
};

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('productos');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testForm, setTestForm] = useState({ name: '', rating: '5', comment: '', image_url: '', is_published: false, sort_order: '0' });
  const [testEditing, setTestEditing] = useState<string | null>(null);
  const [testUploading, setTestUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const testImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (adminTab === 'referencias') fetchTestimonials();
  }, [adminTab]);

  async function fetchTestimonials() {
    setTestLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    if (data) setTestimonials(data as Testimonial[]);
    setTestLoading(false);
  }

  async function handleTestImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestUploading(true);
    const url = await uploadImage(file);
    if (url) setTestForm({ ...testForm, image_url: url });
    setTestUploading(false);
    if (testImageRef.current) testImageRef.current.value = '';
  }

  async function handleSaveTestimonial() {
    if (!testForm.name || !testForm.comment) return;
    const payload = {
      name: testForm.name,
      rating: parseInt(testForm.rating) || 5,
      comment: testForm.comment,
      image_url: testForm.image_url || null,
      is_published: testForm.is_published,
      sort_order: parseInt(testForm.sort_order) || 0,
    };
    if (testEditing) {
      await supabase.from('testimonials').update(payload).eq('id', testEditing);
    } else {
      await supabase.from('testimonials').insert(payload);
    }
    setShowTestForm(false);
    setTestEditing(null);
    setTestForm({ name: '', rating: '5', comment: '', image_url: '', is_published: false, sort_order: '0' });
    fetchTestimonials();
  }

  async function handleDeleteTestimonial(id: string) {
    if (!confirm('Eliminar esta referencia?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    fetchTestimonials();
  }

  async function toggleTestimonialPublish(t: Testimonial) {
    await supabase.from('testimonials').update({ is_published: !t.is_published }).eq('id', t.id);
    fetchTestimonials();
  }

  function openEditTestimonial(t: Testimonial) {
    setTestForm({
      name: t.name,
      rating: String(t.rating),
      comment: t.comment,
      image_url: t.image_url || '',
      is_published: t.is_published,
      sort_order: String(t.sort_order),
    });
    setTestEditing(t.id);
    setShowTestForm(true);
  }

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }

  function openNewForm() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  }

  function openNewTestimonial() {
    setTestForm({ name: '', rating: '5', comment: '', image_url: '', is_published: false, sort_order: '0' });
    setTestEditing(null);
    setShowTestForm(true);
  }

  function openEditForm(product: Product) {
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      price_usd: product.price_usd ? String(product.price_usd) : '',
      original_price: product.original_price ? String(product.original_price) : '',
      discount: String(product.discount),
      image: product.image || '',
      gallery: product.gallery || [],
      category: product.category,
      badge: product.badge || '',
      details: product.details || '',
      warranty: product.warranty || '',
      status: product.status,
      is_active: product.is_active,
      is_published: product.is_published,
      is_featured: product.is_featured,
      featured_order: String(product.featured_order || 0),
      sort_order: String(product.sort_order),
      service_name: product.service_name || '',
      duration: product.duration || '',
      display_order: String(product.display_order || 0),
      min_quantity: String(product.min_quantity ?? 1),
      max_quantity: product.max_quantity != null ? String(product.max_quantity) : '',
      allow_manual_quantity: product.allow_manual_quantity ?? false,
    });
    setEditing(product.id);
    setShowForm(true);
  }

  async function compressImage(file: File): Promise<Blob> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
    try {
      const bitmap = await createImageBitmap(file);
      const maxWidth = 1200;
      const scale = Math.min(1, maxWidth / bitmap.width);
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82)
      );
      if (blob && blob.size < file.size) return blob;
      return file;
    } catch {
      return file;
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const path = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, compressed, { cacheControl: '31536000', upsert: false, contentType: 'image/jpeg' });

    if (error) {
      alert('Error al subir imagen: ' + error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setForm({ ...form, image: url });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) newUrls.push(url);
    }
    setForm({ ...form, gallery: [...form.gallery, ...newUrls] });
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  function handlePriceSoles(value: string) {
    setForm({
      ...form,
      price: value,
      price_usd: value ? (parseFloat(value) / EXCHANGE_RATE).toFixed(2) : '',
    });
  }

  function handlePriceUsd(value: string) {
    setForm({
      ...form,
      price_usd: value,
      price: value ? (parseFloat(value) * EXCHANGE_RATE).toFixed(2) : '',
    });
  }

  async function handleSave() {
    if (!form.name || !form.price) return;

    const minQty = Math.max(1, parseInt(form.min_quantity) || 1);
    const maxQty = form.max_quantity.trim() ? parseInt(form.max_quantity) : null;
    if (maxQty != null && (isNaN(maxQty) || maxQty < minQty)) {
      alert('La cantidad máxima debe ser igual o mayor que la mínima.');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      price_usd: form.price_usd ? parseFloat(form.price_usd) : null,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      discount: parseInt(form.discount) || 0,
      image: form.image || null,
      gallery: form.gallery,
      category: form.category,
      badge: form.badge || null,
      details: form.details || null,
      warranty: form.warranty || null,
      status: form.status,
      is_active: form.is_active,
      is_published: form.is_published,
      is_featured: form.is_featured,
      featured_order: parseInt(form.featured_order) || 0,
      sort_order: parseInt(form.sort_order) || 0,
      service_name: form.service_name || null,
      duration: form.duration || null,
      display_order: parseInt(form.display_order) || 0,
      min_quantity: minQty,
      max_quantity: maxQty,
      allow_manual_quantity: form.allow_manual_quantity,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing);
    } else {
      await supabase.from('products').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    setEditing(null);
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este producto?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  async function togglePublish(product: Product) {
    await supabase
      .from('products')
      .update({ is_published: !product.is_published, updated_at: new Date().toISOString() })
      .eq('id', product.id);
    fetchProducts();
  }

  async function toggleFeatured(product: Product) {
    await supabase
      .from('products')
      .update({ is_featured: !product.is_featured, updated_at: new Date().toISOString() })
      .eq('id', product.id);
    fetchProducts();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    onBack();
  }

  function removeGalleryImage(index: number) {
    setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== index) });
  }

  // Drag and drop reorder
  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  async function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const items = [...filteredProducts];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, moved);

    const updates = items.map((item, i) => ({
      id: item.id,
      sort_order: i,
    }));

    // Optimistic update
    setProducts((prev) => {
      const mapped = new Map(prev.map((p) => [p.id, p]));
      updates.forEach((u) => {
        const p = mapped.get(u.id);
        if (p) p.sort_order = u.sort_order;
      });
      return [...prev].sort((a, b) => a.sort_order - b.sort_order);
    });

    handleDragEnd();

    for (const u of updates) {
      await supabase.from('products').update({ sort_order: u.sort_order }).eq('id', u.id);
    }
  }

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter((p) => p.category === filterCategory);

  const editableCategories = CATEGORIES;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-gold-500/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-dark-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold">
              <span className="gradient-text-gold">Admin Panel</span>
            </h1>
            <div className="flex items-center gap-1 ml-2 bg-dark-800 rounded-lg p-0.5 border border-gold-500/10 max-w-[58vw] overflow-x-auto">
              {ADMIN_NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setAdminTab(id)} className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${adminTab === id ? 'bg-gold-500/20 text-gold-400' : 'text-gray-400 hover:text-white'}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
            {adminTab === 'productos' && (
              <span className="text-xs text-gray-500 hidden sm:inline">({products.length} productos)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(adminTab === 'productos' || adminTab === 'referencias') && (
              <button
                onClick={() => adminTab === 'productos' ? openNewForm() : openNewTestimonial()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gold text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-dark-700 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Cerrar sesion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {adminTab === 'dashboard' ? (
          <AdminDashboard onNavigate={(t) => setAdminTab(t as AdminTab)} />
        ) : adminTab === 'categorias' ? (
          <AdminCategories />
        ) : adminTab === 'cuentas_ff' ? (
          <AdminFreeFireAccounts />
        ) : adminTab === 'pedidos' ? (
          <AdminOrders />
        ) : adminTab === 'pagos' ? (
          <AdminPayments />
        ) : adminTab === 'correos' ? (
          <AdminEmails />
        ) : adminTab === 'numeros' ? (
          <AdminNumbers />
        ) : adminTab === 'inventario' ? (
          <AdminInventory />
        ) : adminTab === 'ventas' || adminTab === 'ganancias' ? (
          <AdminSales mode={adminTab} />
        ) : adminTab === 'configuracion' ? (
          <AdminSettings />
        ) : adminTab === 'catalogo' ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => setAdminTab('productos')} className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10 text-left hover:border-gold-500/30 transition-colors">
                <Package className="w-5 h-5 text-gold-400 mb-2" /><h3 className="font-bold text-white">Productos</h3><p className="text-xs text-gray-500 mt-1">Crear, editar, publicar y ordenar productos.</p>
              </button>
              <button onClick={() => setAdminTab('categorias')} className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10 text-left hover:border-gold-500/30 transition-colors">
                <FolderTree className="w-5 h-5 text-gold-400 mb-2" /><h3 className="font-bold text-white">Categorías</h3><p className="text-xs text-gray-500 mt-1">Secciones del catálogo público.</p>
              </button>
              <button onClick={() => setAdminTab('referencias')} className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10 text-left hover:border-gold-500/30 transition-colors">
                <MessageSquare className="w-5 h-5 text-gold-400 mb-2" /><h3 className="font-bold text-white">Referencias</h3><p className="text-xs text-gray-500 mt-1">Testimonios visibles en la web.</p>
              </button>
              <button onClick={() => setAdminTab('promocion')} className="p-5 rounded-2xl bg-dark-800 border border-gold-500/10 text-left hover:border-gold-500/30 transition-colors">
                <Megaphone className="w-5 h-5 text-gold-400 mb-2" /><h3 className="font-bold text-white">Promoción</h3><p className="text-xs text-gray-500 mt-1">Banner promocional del catálogo.</p>
              </button>
            </div>
          </div>
        ) : adminTab === 'estadisticas' ? (
          <AdminStats />
        ) : adminTab === 'promocion' ? (
          <AdminBanner />
        ) : adminTab === 'clientes' ? (
          <AdminCustomers />
        ) : adminTab === 'referencias' ? (
          <>
            <p className="text-xs text-gray-500 mb-4">Gestiona las referencias y testimonios visibles en la página pública</p>
            {testLoading ? (
              <div className="text-center py-16 text-gray-500">Cargando...</div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No hay referencias.</p>
                <button onClick={openNewTestimonial} className="px-6 py-3 rounded-xl bg-gold-500/20 text-gold-400 font-semibold border border-gold-500/30">
                  Agregar Referencia
                </button>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all ${
                      t.is_published
                        ? 'bg-dark-700/40 border-green-500/10'
                        : 'bg-dark-800/40 border-white/5 opacity-70'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0 flex items-center justify-center">
                      {t.image_url ? (
                        <img src={t.image_url} alt={t.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <Star className="w-5 h-5 text-gold-500/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-white truncate">{t.name}</h3>
                        <div className="flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-gold-400 text-gold-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{t.comment}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {t.is_published ? (
                          <span className="text-[10px] text-green-400">PUBLICADO</span>
                        ) : (
                          <span className="text-[10px] text-gray-600">BORRADOR</span>
                        )}
                        {t.image_url && <span className="text-[10px] text-gray-500">con imagen</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleTestimonialPublish(t)}
                        className={`p-2 rounded-lg transition-colors ${
                          t.is_published ? 'hover:bg-green-500/10 text-green-400' : 'hover:bg-gray-500/10 text-gray-500'
                        }`}
                        title={t.is_published ? 'Despublicar' : 'Publicar'}
                      >
                        {t.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditTestimonial(t)}
                        className="p-2 rounded-lg hover:bg-gold-500/10 text-gold-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
        <>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                : 'bg-dark-700 text-gray-400 border border-white/5 hover:text-white'
            }`}
          >
            Todos
          </button>
          {editableCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCategory === cat.id
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'bg-dark-700 text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-4">Arrastra los productos para reordenar</p>

        {/* Product List */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Cargando...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No hay productos.</p>
            <button onClick={openNewForm} className="px-6 py-3 rounded-xl bg-gold-500/20 text-gold-400 font-semibold border border-gold-500/30">
              Agregar Producto
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(index)}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  dragOverIndex === index
                    ? 'border-gold-500/50 bg-gold-500/5'
                    : product.is_published
                      ? 'bg-dark-700/40 border-green-500/10'
                      : 'bg-dark-800/40 border-white/5 opacity-70'
                } ${dragIndex === index ? 'opacity-50 scale-95' : ''}`}
              >
                <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />

                {/* Thumbnail */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                    {product.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-400 hidden sm:inline">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-medium text-white">S/{product.price}</span>
                    {product.price_usd && (
                      <span className="text-gray-500">${product.price_usd}</span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      product.status === 'disponible'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {product.status}
                    </span>
                    {product.is_published ? (
                      <span className="text-[10px] text-green-400">PUBLICADO</span>
                    ) : (
                      <span className="text-[10px] text-gray-600">BORRADOR</span>
                    )}
                    {product.is_featured && (
                      <span className="text-[10px] text-gold-400 font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-gold-400" /> DESTACADO
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFeatured(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.is_featured ? 'text-gold-400 hover:bg-gold-500/10' : 'text-gray-600 hover:bg-gray-500/10'
                    }`}
                    title={product.is_featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                  >
                    <Star className={`w-4 h-4 ${product.is_featured ? 'fill-gold-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => togglePublish(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      product.is_published ? 'hover:bg-green-500/10 text-green-400' : 'hover:bg-gray-500/10 text-gray-500'
                    }`}
                    title={product.is_published ? 'Despublicar' : 'Publicar'}
                  >
                    {product.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(product)}
                    className="p-2 rounded-lg hover:bg-gold-500/10 text-gold-400 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
        )}

      </div>

      {/* Testimonial Modal Form */}
      {showTestForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-dark-800 rounded-2xl border border-gold-500/10 p-5 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {testEditing ? 'Editar Referencia' : 'Nueva Referencia'}
              </h2>
              <button onClick={() => setShowTestForm(false)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre *</label>
                  <input
                    type="text"
                    value={testForm.name}
                    onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                    placeholder="Nombre del cliente"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Estrellas</label>
                  <select
                    value={testForm.rating}
                    onChange={(e) => setTestForm({ ...testForm, rating: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  >
                    <option value="5">5 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="3">3 estrellas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Comentario *</label>
                <textarea
                  value={testForm.comment}
                  onChange={(e) => setTestForm({ ...testForm, comment: e.target.value })}
                  rows={3}
                  placeholder="Texto del testimonio..."
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Captura de pantalla (opcional)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => testImageRef.current?.click()}
                    disabled={testUploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-sm text-gray-300 hover:border-gold-500/50 hover:text-white transition-all disabled:opacity-50"
                  >
                    {testUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {testUploading ? 'Subiendo...' : 'Subir imagen'}
                  </button>
                  <input
                    ref={testImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleTestImageUpload}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={testForm.image_url}
                    onChange={(e) => setTestForm({ ...testForm, image_url: e.target.value })}
                    placeholder="O pega una URL"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                {testForm.image_url && (
                  <div className="mt-3 relative w-32 h-24 rounded-xl overflow-hidden bg-dark-600 border border-gold-500/10">
                    <img src={testForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setTestForm({ ...testForm, image_url: '' })}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={testForm.sort_order}
                    onChange={(e) => setTestForm({ ...testForm, sort_order: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testForm.is_published}
                      onChange={(e) => setTestForm({ ...testForm, is_published: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-white/20"
                    />
                    <span className="text-xs text-gray-300">Publicado</span>
                  </label>
                </div>
              </div>
              <button
                onClick={handleSaveTestimonial}
                disabled={!testForm.name || !testForm.comment}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {testEditing ? 'Guardar Cambios' : 'Crear Referencia'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-dark-800 rounded-2xl border border-gold-500/10 p-5 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {editing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-dark-600">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: 624 Diamantes Free Fire"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Descripcion corta</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none resize-none"
                />
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  <Upload className="w-3 h-3 inline mr-1" />
                  Imagen principal
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-sm text-gray-300 hover:border-gold-500/50 hover:text-white transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Subir imagen
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="O pega una URL"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                {form.image && (
                  <div className="mt-3 relative w-32 h-24 rounded-xl overflow-hidden bg-dark-600 border border-gold-500/10">
                    <img src={form.image} alt="Preview" className="w-full h-full object-contain bg-dark-700" />
                    <button
                      onClick={() => setForm({ ...form, image: '' })}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Galeria de imagenes</label>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-sm text-gray-300 hover:border-gold-500/50 hover:text-white transition-all disabled:opacity-50"
                >
                  {uploadingGallery ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Subir imagenes a galeria
                    </>
                  )}
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                {form.gallery.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {form.gallery.map((url, i) => (
                      <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden bg-dark-600 group border border-gold-500/10">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeGalleryImage(i)}
                          className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prices with conversion */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Precios (tasa: 1 USD = S/{EXCHANGE_RATE})
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-green-400 font-bold">S/ SOLES</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => handlePriceSoles(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-gold-400 font-bold">$ USD</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price_usd}
                      onChange={(e) => handlePriceUsd(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-gray-500 font-bold">PRECIO ORIGINAL</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={form.original_price}
                      onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Discount, Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  >
                    {editableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Descuento %</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Badge</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Popular"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Detalles completos</label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  rows={3}
                  placeholder="Escribe los detalles del producto..."
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none resize-none"
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Garantia</label>
                <input
                  type="text"
                  value={form.warranty}
                  onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                  placeholder="Ej: Garantia de 30 dias"
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                />
              </div>

              {/* Variant grouping */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Servicio (variantes)</label>
                  <input
                    type="text"
                    value={form.service_name}
                    onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                    placeholder="Ej: Crunchyroll Mega Fan"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Duración</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="Ej: 3 meses"
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm placeholder:text-gray-600 focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Orden variante</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cantidad por pedido */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Cantidad por pedido</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold mb-1">CANTIDAD MÍNIMA</span>
                    <input
                      type="number"
                      min="1"
                      value={form.min_quantity}
                      onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
                      placeholder="1"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold mb-1">CANTIDAD MÁXIMA</span>
                    <input
                      type="number"
                      min="1"
                      value={form.max_quantity}
                      onChange={(e) => setForm({ ...form, max_quantity: e.target.value })}
                      placeholder="Sin límite"
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={form.allow_manual_quantity}
                    onChange={(e) => setForm({ ...form, allow_manual_quantity: e.target.checked })}
                    className="w-4 h-4 rounded bg-dark-700 border-white/20"
                  />
                  <span className="text-xs text-gray-300">Permitir escribir la cantidad directamente</span>
                </label>
                <p className="text-[11px] text-gray-600 mt-1.5">
                  La cantidad mínima también es la cantidad inicial. Deja el máximo vacío para no poner tope.
                </p>
              </div>

              {/* Status & Publishing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'disponible' | 'agotado' })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-700 border border-gold-500/10 text-white text-sm focus:border-gold-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2 pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-white/20"
                    />
                    <span className="text-xs text-gray-300">Publicado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-white/20"
                    />
                    <span className="text-xs text-gray-300">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded bg-dark-700 border-white/20"
                    />
                    <span className="text-xs text-gray-300">Destacado</span>
                  </label>
                  {form.is_featured && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 whitespace-nowrap">Orden destacado</span>
                      <input
                        type="number"
                        value={form.featured_order}
                        onChange={(e) => setForm({ ...form, featured_order: e.target.value })}
                        className="w-16 px-2 py-1.5 rounded-lg bg-dark-700 border border-gold-500/10 text-white text-xs focus:border-gold-500/50 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-gold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
