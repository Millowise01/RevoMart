import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../core/product_cache.dart';
import 'product_list_screen.dart';
import 'login_screen.dart';
import '../core/auth_provider.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiClient();
  List<dynamic> products = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final cached = ProductCache.getCachedProducts();
    if (cached != null) {
      setState(() {
        products = cached;
        loading = false;
      });
    }
    try {
      final res = await _api.get('/products?limit=8') as Map<String, dynamic>;
      final items = res['items'] as List<dynamic>;
      await ProductCache.saveProducts(items);
      setState(() {
        products = items;
        loading = false;
      });
    } catch (_) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('RevoMart', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF059669),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              if (auth.isLoggedIn) {
                // navigate to profile
              } else {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: loading && products.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF059669), Color(0xFF0D9488)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Shop smarter.\nLive greener.',
                            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                        SizedBox(height: 8),
                        Text('New, used, refurbished & upcycled',
                            style: TextStyle(color: Colors.white70)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Featured', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      TextButton(
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const ProductListScreen()),
                        ),
                        child: const Text('See all'),
                      ),
                    ],
                  ),
                  ...products.map((p) => _ProductTile(product: p as Map<String, dynamic>)),
                ],
              ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.shopping_bag), label: 'Shop'),
          NavigationDestination(icon: Icon(Icons.shopping_cart), label: 'Cart'),
        ],
        onDestinationSelected: (i) {
          if (i == 1) {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const ProductListScreen()));
          }
        },
      ),
    );
  }
}

class _ProductTile extends StatelessWidget {
  final Map<String, dynamic> product;
  const _ProductTile({required this.product});

  @override
  Widget build(BuildContext context) {
    final images = product['images'] as List<dynamic>?;
    final imageUrl = images?.isNotEmpty == true ? images!.first['url'] as String : null;
    final price = product['discountPrice'] ?? product['price'];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: imageUrl != null
            ? ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(imageUrl, width: 56, height: 56, fit: BoxFit.cover),
              )
            : const Icon(Icons.image, size: 48),
        title: Text(product['name'] as String, maxLines: 2, overflow: TextOverflow.ellipsis),
        subtitle: Text('GHS $price'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {},
      ),
    );
  }
}
