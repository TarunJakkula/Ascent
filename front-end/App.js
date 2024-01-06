// App.js
import {io} from 'socket.io-client'
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import LoadingScreen from './LoadingScreen'; // Adjust the path accordingly

const logo = require('./assets/logo.png');

export default function App() {
  const [currentGroup, setCurrentGroup] = useState('Valorant');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef();
  const [socket,setSocket]=useState(null);
  
  useEffect(()=>{
    if(socket && scrollViewRef)
    socket.on("newMsgRec",async (msgs)=>{
      const {text,stream,type}=msgs;
      console.log(msgs,"msgs");
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: text,
          group: stream,
          sender: type,
        },
      ]);
      scrollViewRef.current.scrollToEnd({ animated: true });
    });
    if(socket && scrollViewRef)
    socket.on("newImgRec",async (img)=>{
      console.log(img,"img")
      setMessages((prevMessages)=>{[
        ...prevMessages,
        img]
      })
      scrollViewRef.current.scrollToEnd({ animated: true });
    })

  },[socket])

  useEffect(() => {
    // Simulating an asynchronous operation (e.g., fetching data) for 2 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    //const soc = io('http://localhost:3001', {transports: ['websocket']})
    const soc = io('http://192.168.74.135:3001', { transports: ['websocket'] })

    setSocket(soc);

    soc.on('connect',()=>{
      console.log('connected')
    })

    // Clear the timer if the component is unmounted
    return () => clearTimeout(loadingTimer);
  }, []);

  const switchGroup = (group) => {
    setCurrentGroup(group);
  };

  const sendNotification = async () => {
    try {
      const notificationContent = {
        title: 'Players Needed',
        body: 'We need more players! Join the game.',
      };
  
      // Add a system message to the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Players Needed! Join the game.',
          group: currentGroup,
          sender: 'ping',
        },
      ]);
      const pingdata = {text: 'Players Needed! Join the game.', 
      stream: currentGroup,
      type: 'ping'}
      
      socket.emit("newMsg",pingdata);

      // Send notifications to all users in the current group
      await Promise.all(
        messages
          .filter((msg) => msg.group === currentGroup && msg.sender !== 'me')
          .map(async (user) => {
            try {
              const notification = await Notifications.scheduleNotificationAsync({
                content: notificationContent,
                to: user.sender,
                trigger: null, // Explicitly set trigger to null for immediate notification
              });
  
              if (notification && notification.data) {
                const { requestor } = notification.data;
                console.log(`Notification sent to ${requestor}`);
              } else {
                console.log('Notification sent, but requestor information not available.');
              }
            } catch (error) {
              console.error('Error sending notification:', error);
            }
          })
      );
  
      console.log('Notifications sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      

      if (!result.canceled) {
        // Use the "assets" array instead of "uri"
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()!=="") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: newMessage,
          image: selectedImage, // Add the image URI to the message
          group: currentGroup,
          sender: 'me',
        },
      ]);

      const textdata={text: newMessage, 
      stream: currentGroup,
      type: 'text'}
      socket.emit("newMsg",textdata);
      setNewMessage("");
      setSelectedImage(null); // Clear the selected image after sending

      // Scroll to the end of the list when a new message is sent
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
    else if (selectedImage!==null){
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: newMessage,
          image: selectedImage, // Add the image URI to the message
          group: currentGroup,
          sender: 'me',
        },
      ]);
      const temp = {
        text: newMessage,
        image: selectedImage, // Add the image URI to the message
        group: currentGroup,
        sender: 'me',
      };
      socket.emit("newImg",temp);
      setNewMessage("");
      setSelectedImage(null);
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const finishLoading = () => {
    setIsLoading(false);
  };

  // Add a new style for system messages
  const systemMessageStyle = {
    backgroundColor: '#3498db', // Set the background color for system messages
    alignSelf: 'center', // Center-align the system messages
    color: 'white', // Set the text color for system messages
    borderRadius: 2, // Add some border-radius for a rounded appearance
    padding: 8, // Add padding to the system messages
    marginBottom: 8, // Adjust the margin at the bottom
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingScreen onFinishLoading={finishLoading} />
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={logo} style={styles.logo} />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.groupButton, currentGroup === 'Valorant' && styles.activeButton]}
                onPress={() => switchGroup('Valorant')}
              >
                <Text style={styles.buttonText}>Valorant</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.groupButton, currentGroup === 'CSGO' && styles.activeButton]}
                onPress={() => switchGroup('CSGO')}
              >
                <Text style={styles.buttonText}>CS:GO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.groupButton, currentGroup === 'RocketLeague' && styles.activeButton]}
                onPress={() => switchGroup('RocketLeague')}
              >
                <Text style={styles.buttonText}>R.L</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.messagesContainer}>
            <FlatList
              ref={scrollViewRef}
              data={messages.filter((msg) => msg.group === currentGroup)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageContainer,
                    item.sender === 'me' ? styles.myMessageContainer : styles.otherMessageContainer,
                    item.sender === 'ping' && systemMessageStyle, // Apply system message style
                  ]}
                >
                  {item.image ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: item.image }} style={styles.messageImage} />
                      {item.sender !== 'ping' && (
                        <MaterialIcons name="attachment" size={16} color="white" style={styles.attachmentIcon} />
                      )}
                    </View>
                  ) : (
                    <Text style={styles.messageText}>{item.text}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              // placeholder="Type your message..."
              value={newMessage}
              onChangeText={(text) => setNewMessage(text)}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <MaterialIcons name="send" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={pickImage}>
              <MaterialIcons name="image" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={sendNotification}>
              <MaterialIcons name="notifications" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },

  header: {
    marginTop: -30,
    marginBottom: 20,
  },

  logo: {
    width: '45%',
    height: '45%',
    resizeMode: 'contain',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -25,
    borderBottomWidth: 0.7,  // Add a bottom border
    borderBottomColor: 'grey',
    paddingBottom: 6
  },

  groupButton: {
    flex: 1,
    padding: 5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    marginHorizontal: 4,
  },

  activeButton: {
    backgroundColor: '#4CAF50',
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
  },

  messagesContainer: {
    flex: 1,
    marginBottom: 60, // Adjust this value to set the space above the input container
    marginTop: -130
  },

  messageContainer: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    maxWidth: '100%',
    flex: 1,
  },

  messageText: {
    color: 'white',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    paddingBottom: 16,
  },

  input: {
    flex: 1,
    padding: 7,
    marginRight: 6,
    marginLeft: -10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    color: 'white',
  },

  sendButton: {
    padding: 5,
    backgroundColor: '#087099',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  imageContainer: {
    position: 'relative',
  },

  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },

  attachmentIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },

  myMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 0,
  },

  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#3498db',
    borderBottomLeftRadius: 0,
  },
});
