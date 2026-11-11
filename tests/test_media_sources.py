"""来源注册表：只剩 Google Drive 与 OneDrive 两条路。"""
import unittest

from peach import media_sources


class SourceRegistryTests(unittest.TestCase):
    def test_registry_lists_the_two_drives(self):
        self.assertEqual([source.id for source in media_sources.SOURCE_REGISTRY], ['gdrive', 'onedrive'])
        self.assertEqual([label for _, label in media_sources.SOURCE_OPTIONS], ['Google Drive', 'OneDrive'])
        self.assertEqual(set(media_sources.CLOUD_LOCATIONS), {'gdrive', 'onedrive'})


if __name__ == '__main__':
    unittest.main()
