import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function App() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const GOOGLE_VISION_API_KEY = ''; // Replace with your actual key

  const pickImageAndScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.[0].base64) {
      const base64Image = result.assets[0].base64;
      setImage(result.assets[0].uri);
      scanText(base64Image);
    }
  };

  const scanText = async (base64Image) => {
    setLoading(true);
    setOcrText('');
    setParsedData([]);
    try {
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const text =
        response?.data?.responses?.[0]?.fullTextAnnotation?.text || '';
      setOcrText(text);
      setParsedData(parseInvoiceText(text));
    } catch (error) {
      console.log('OCR error:', error?.response?.data || error.message);
      Alert.alert(
        'OCR Failed',
        error?.response?.data?.error?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const parseInvoiceText = (text) => {
    const lines = text.split('\n');
    const data = [];
    lines.forEach((line) => {
      const parts = line.trim().split(/\s{2,}|\t+/);
      if (parts.length === 7) {
        data.push({
          itemDescription: parts[0],
          hsn: parts[1],
          quantity: parts[2],
          unitPrice: parts[3],
          gstPercent: parts[4],
          gstAmount: parts[5],
          totalAmount: parts[6],
        });
      }
    });
    return data;
  };

  const exportToExcel = async () => {
    if (!parsedData.length) {
      Alert.alert('Nothing to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(parsedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const filename = FileSystem.documentDirectory + 'invoice.xlsx';

    await FileSystem.writeAsStringAsync(filename, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(filename, {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Share Invoice Excel',
      UTI: 'com.microsoft.excel.xlsx',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Invoice OCR Scanner</Text>
      <Button title="Capture Invoice" onPress={pickImageAndScan} />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {ocrText ? (
        <>
          <Text style={styles.subtitle}>Extracted Text:</Text>
          <Text style={styles.textBox}>{ocrText}</Text>
          <Button title="Export to Excel" onPress={exportToExcel} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 18,
  },
  textBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
    fontSize: 14,
  },
});
