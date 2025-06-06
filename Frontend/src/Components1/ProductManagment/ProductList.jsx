import React, { useState, useEffect, useContext } from 'react';
import BrandManager from './BrandManager';
import { Authcontext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../../AxiosClient';

export default function ProductList() {
  const { islogged } = useContext(Authcontext);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', image: '', tags: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!islogged) {
      navigate('/');
    }
  }, [islogged, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('api');
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prevState) => ({
          ...prevState,
          image: reader.result,
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    try {
      const data = { ...newProduct, tags: newProduct.tags.split(',').map(t => t.trim()) };
      await axiosClient.post('api/', data);
      setNewProduct({ title: '', description: '', image: '', tags: '' });
      setImagePreview(null);
      fetchProducts();
      setSuccessMessage('Service Added!');
      setShowSuccess(true);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await axiosClient.put(`api/${selectedProduct._id}`, selectedProduct);
      fetchProducts();
      setSelectedProduct(null);
      setSuccessMessage('Service Updated!');
      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const confirmDeleteProduct = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`api/${deleteTargetId}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleteLoading(false);
      setSelectedProduct(null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Back Button + Title */}
      <div className='flex w-full'>
        <svg
          fill="#7c7979"
          className='size-9 ml-1 fill-gray-700 hover:cursor-pointer hover:scale-105 hover:bg-gray-200 rounded-2xl'
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 219.151 219.151"
          stroke="#7c7979"
          onClick={() => { navigate('/admin-panel') }}
        >
          <g>
            <path d="M109.576,219.151c60.419,0,109.573-49.156,109.573-109.576C219.149,49.156,169.995,0,109.576,0S0.002,49.156,0.002,109.575 C0.002,169.995,49.157,219.151,109.576,219.151z M109.576,15c52.148,0,94.573,42.426,94.574,94.575 c0,52.149-42.425,94.575-94.574,94.576c-52.148-0.001-94.573-42.427-94.573-94.577C15.003,57.427,57.428,15,109.576,15z" />
            <path d="M94.861,156.507c2.929,2.928,7.678,2.927,10.606,0c2.93-2.93,2.93-7.678-0.001-10.608l-28.82-28.819l83.457-0.008 c4.142-0.001,7.499-3.358,7.499-7.502c-0.001-4.142-3.358-7.498-7.5-7.498l-83.46,0.008l28.827-28.825 c2.929-2.929,2.929-7.679,0-10.607c-1.465-1.464-3.384-2.197-5.304-2.197c-1.919,0-3.838,0.733-5.303,2.196l-41.629,41.628 c-1.407,1.406-2.197,3.313-2.197,5.303c0.001,1.99,0.791,3.896,2.198,5.305L94.861,156.507z" />
          </g>
        </svg>
        <div className="w-full flex justify-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-800">Product Manager</h2>
        </div>
      </div>

      {/* Add Product Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input type="text" placeholder="Title" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="text" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="file" onChange={handleImageChange} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="text" placeholder="Tags (comma separated)" value={newProduct.tags} onChange={e => setNewProduct({ ...newProduct, tags: e.target.value })} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 mt-4 object-cover rounded-md" />}

      </div>
      <button onClick={handleAddProduct} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 mb-8">Add Product</button>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <img src={product.image} alt={product.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{product.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                <p className="text-xs text-gray-500 mt-2">Tags: {product.tags.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Delete Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={selectedProduct.title} onChange={e => setSelectedProduct({ ...selectedProduct, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={selectedProduct.description} onChange={e => setSelectedProduct({ ...selectedProduct, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input type="file" onChange={handleImageChange} className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 mt-4 object-cover rounded-md" />}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input type="text" value={selectedProduct.tags.join(', ')} onChange={e => setSelectedProduct({ ...selectedProduct, tags: e.target.value.split(',').map(t => t.trim()) })} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div className="mb-6">
                <img src={selectedProduct.image} alt="Preview" className="w-full h-48 object-contain border rounded-lg" />
              </div>
              <button onClick={handleUpdateProduct} className="bg-blue-600 text-white px-6 py-2 rounded-lg mr-3 hover:bg-blue-700 transition-colors">Update</button>
              <button onClick={() => confirmDeleteProduct(selectedProduct._id)} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
              <hr className="my-6" />
              <BrandManager product={selectedProduct} onRefresh={fetchProducts} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Delete Service</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this service? This action cannot be undone.</p>
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-70"
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-xs w-full mx-4 text-center transform animate-bounce-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{successMessage}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {successMessage === 'Service Updated!'
                ? 'The service has been successfully updated.'
                : 'A new service has been successfully added.'
              }
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-colors duration-200 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}