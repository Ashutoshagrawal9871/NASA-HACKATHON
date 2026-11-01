#include<iostream>
using namespace std;

class student{
    public:
    int rollno;
    int mark;

    void input(){
        cout<<"Enter Roll no:";
        cin>>rollno;
        cout<<"Mark:";
        cin>>mark;
    }

    void display(){
        cout<<"Roll no:"<<rollno<<", Mark:"<<mark<<endl;
    }
};

int main(){
    //dynamically allocated memory
    student* s= new student[5];

    for(int i=0;i<5;i++){
        cout<<"\nstudent "<<i+1<<endl;
        s[i].input();  
    }
    cout<<"\n";

    for(int i=0;i<5;i++){
        s[i].display();
    }
    //free memory
    delete[]s;

    return 0;
}