#include<iostream>
#include<cstring>

using namespace std ;
int main(){
    int size;
    cout<<"Enter the size :";
    cin>>size;
    char* str =new char[size]; //because of last block ma null pointer aata hai string ma \0

    cout<<"Enter the string :";
    cin.ignore(); //clear input buffer
    cin.getline(str,size);//read full string including space
    
    cout<<"you entered: "<<str;

    delete[]str;

    return 0;
}