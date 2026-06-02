import 'package:flutter/material.dart';
import '../core/api_client.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _api = ApiClient();
  List<dynamic> products = [];
  String? condition;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final path = condition != null ? '/products?condition=$condition' : '/products';
    final res = await _api.get(path) as Map<String, dynamic>;
    setState(() => products = res['items'] as List<dynamic>);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shop'),
        backgroundColor: const Color(0xFF059669),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(12),
            child: Row(
              children: ['', 'NEW', 'USED', 'REFURBISHED', 'UPCYCLED'].map((c) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(c.isEmpty ? 'All' : c),
                    selected: condition == (c.isEmpty ? null : c),
                    onSelected: (_) {
                      setState(() => condition = c.isEmpty ? null : c);
                      _load();
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.72,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: products.length,
              itemBuilder: (_, i) {
                final p = products[i] as Map<String, dynamic>;
                return Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: Container(color: Colors.grey.shade100)),
                      Padding(
                        padding: const EdgeInsets.all(8),
                        child: Text(p['name'] as String, maxLines: 2, overflow: TextOverflow.ellipsis),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
