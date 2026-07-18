// admin.js - Uses Firebase (db.js)

import { getAllProducts, saveProduct, deleteProduct } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
    const productsBody = document.getElementById('products-body');
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const sizesContainer = document.getElementById('sizes-container');
    const imageInput = document.getElementById('product-image-file');
    const imagePreview = document.getElementById('image-preview');
    
    let currentImageUrl = "";

    function showAlert(msg, type) {
        const alert = document.getElementById('alert-msg');
        alert.textContent = msg;
        alert.style.display = 'block';
        alert.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        alert.style.color = type === 'success' ? '#155724' : '#721c24';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }

    async function renderTable() {
        productsBody.innerHTML = '<tr><td colspan="4">Loading products...</td></tr>';
        const products = await getAllProducts();
        productsBody.innerHTML = '';
        
        products.forEach(p => {
            const tr = document.createElement('tr');
            const imgSrc = p.image || 'https://via.placeholder.com/50?text=No+Img';
            const basePrice = p.sizes && p.sizes.length > 0 ? p.sizes[0].price : 'N/A';
            
            tr.innerHTML = `
                <td><img src="${imgSrc}" class="product-img-preview"></td>
                <td><strong>${p.name}</strong></td>
                <td>₹${basePrice}</td>
                <td>
                    <button class="btn btn-sm edit-btn" data-id="${p.id}" style="padding: 5px 10px;">Edit</button>
                    <button class="btn btn-sm btn-danger del-btn" data-id="${p.id}" style="padding: 5px 10px;">Delete</button>
                </td>
            `;
            productsBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openModal(e.target.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm('Are you sure you want to delete this product?')) {
                    try {
                        await deleteProduct(e.target.getAttribute('data-id'));
                        renderTable();
                        showAlert('Product deleted!', 'success');
                    } catch (err) {
                        showAlert('Error deleting product', 'error');
                    }
                }
            });
        });
    }

    function createSizeInput(size = '', price = '') {
        const div = document.createElement('div');
        div.className = 'size-group';
        div.innerHTML = `
            <input type="text" placeholder="Size (e.g. 500ml)" value="${size}" class="size-val" required>
            <input type="number" placeholder="Price (₹)" value="${price}" class="price-val" required>
            <button type="button" class="btn btn-danger btn-sm rem-size-btn" style="padding: 5px 10px;">X</button>
        `;
        div.querySelector('.rem-size-btn').addEventListener('click', () => div.remove());
        return div;
    }

    // Handle Image Selection and Compress
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Compress image using canvas
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress to JPEG with 0.7 quality to save space
                    currentImageUrl = canvas.toDataURL('image/jpeg', 0.7);
                    
                    imagePreview.innerHTML = `<img src="${currentImageUrl}" style="max-width: 150px; border-radius: 4px;">`;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            currentImageUrl = "";
            imagePreview.innerHTML = "";
        }
    });

    async function openModal(id = null) {
        modal.classList.add('active');
        sizesContainer.innerHTML = '';
        form.reset();
        currentImageUrl = "";
        imagePreview.innerHTML = "";
        imageInput.value = "";
        
        if (id) {
            document.getElementById('modal-title').textContent = 'Edit Product';
            const products = await getAllProducts();
            const p = products.find(x => x.id === id);
            if (p) {
                document.getElementById('product-id').value = p.id;
                document.getElementById('product-name').value = p.name;
                document.getElementById('product-desc').value = p.desc;
                document.getElementById('product-hover').value = p.hover_info.join(', ');
                
                if (p.image) {
                    currentImageUrl = p.image;
                    imagePreview.innerHTML = `<img src="${p.image}" style="max-width: 150px; border-radius: 4px;">`;
                }

                p.sizes.forEach(s => {
                    sizesContainer.appendChild(createSizeInput(s.size, s.price));
                });
            }
        } else {
            document.getElementById('modal-title').textContent = 'Add Product';
            document.getElementById('product-id').value = '';
            sizesContainer.appendChild(createSizeInput()); 
        }
    }

    document.getElementById('add-btn').addEventListener('click', () => openModal());
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    document.getElementById('add-size-btn').addEventListener('click', () => {
        sizesContainer.appendChild(createSizeInput());
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('save-btn');
        const origText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const id = document.getElementById('product-id').value || 'p_' + Date.now();

            const hoverStr = document.getElementById('product-hover').value;
            const hover_info = hoverStr ? hoverStr.split(',').map(s => s.trim()).filter(s => s) : [];
            
            const sizes = [];
            document.querySelectorAll('.size-group').forEach((group, index) => {
                const size = group.querySelector('.size-val').value;
                const price = parseInt(group.querySelector('.price-val').value);
                sizes.push({
                    size,
                    price,
                    selected: index === 1 || false 
                });
            });
            if (sizes.length > 0) sizes[0].selected = true; 

            const newProduct = {
                id,
                name: document.getElementById('product-name').value,
                image: currentImageUrl,
                desc: document.getElementById('product-desc').value,
                hover_info,
                sizes
            };

            await saveProduct(newProduct);
            
            modal.classList.remove('active');
            renderTable();
            showAlert('Changes saved successfully!', 'success');
        } catch (err) {
            showAlert('Error saving product! It might be too large.', 'error');
            console.error(err);
        } finally {
            saveBtn.textContent = origText;
            saveBtn.disabled = false;
        }
    });

    // Initial render
    renderTable();
});
