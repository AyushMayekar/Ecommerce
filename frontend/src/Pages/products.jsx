const Products = () => {
    const products = [
        { id: 1, name: 'Hotwheels', price: '₹100/-', image: '/images/hotwheels.webp' },
        { id: 2, name: 'Protien Supplement', price: '₹150/-', image: '/images/Protein.webp' },
        { id: 3, name: 'Sports Shoes', price: '₹200/-', image: '/images/Shoes.webp' },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Products</h1>
            <p className="mb-6">Check out our range of quality products. MRP and bulk pricing available on login.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden shadow-md">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                            <p className="text-gray-700">{product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;
