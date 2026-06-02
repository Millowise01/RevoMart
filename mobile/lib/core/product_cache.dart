import 'package:hive_flutter/hive_flutter.dart';

class ProductCache {
  static const boxName = 'products_cache';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(boxName);
  }

  static Future<void> saveProducts(List<dynamic> products) async {
    final box = Hive.box(boxName);
    await box.put('catalog', products);
    await box.put('cached_at', DateTime.now().toIso8601String());
  }

  static List<dynamic>? getCachedProducts() {
    final box = Hive.box(boxName);
    return box.get('catalog') as List<dynamic>?;
  }
}
