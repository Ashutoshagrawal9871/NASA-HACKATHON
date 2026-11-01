#include<iostream>
using namespace std;
int main(){
    
    try{
        throw(5);
    }
    
    catch(int e){
        cout<<"input is integer value ";
    }
    catch(double e){
        cout<<" input is double value ";
    }
    catch(char e){
        cout<<"input is char value";
    }
    return 0;
}